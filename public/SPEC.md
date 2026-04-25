# Technical Specification – Note Taking Web App

## 1. Overview

A web application where authenticated users can create, view, edit, delete, and publicly share rich-text notes. Notes are created with TipTap, stored as JSON in a SQLite database, and rendered in the browser with formatting.

### Core Features

- User authentication (sign up, login, logout) via better-auth
- Authenticated note management (CRUD)
- Rich text editor using TipTap with:
  - Bold, Italic
  - Heading levels (H1–H3) + normal text
  - Inline code + code blocks
  - Bullet lists
  - Horizontal rules
- Public sharing of notes via a public URL (toggle on/off)

### Tech Stack

- **Framework:** Next.js (App Router)
- **Runtime:** Bun
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Database:** SQLite via Bun's built-in SQLite client
- **Authentication:** better-auth
- **Rich Text Editor:** TipTap

---

## 2. Architecture

### 2.1 High-Level Architecture

- **Frontend & Backend:** Next.js (App Router)
  - Server components for data fetching
  - Client components for TipTap editor and interactive UI
  - Route Handlers (`app/api/.../route.ts`) for JSON APIs
- **Runtime:** Bun (for dev & production)
- **Database:** Single SQLite file (e.g., `data/app.db`) accessed via Bun's SQLite client
- **Auth:** better-auth integrated into Next.js (middleware + server helpers)

### 2.2 Application Layers

**Presentation Layer**
- Next.js pages and components
- TailwindCSS for styling
- TipTap editor component

**API Layer**
- REST-like JSON endpoints for notes CRUD & sharing

**Data Access Layer**
- Raw SQL queries executed via Bun's SQLite client
- Small helper module for DB access

---

## 3. Functional Requirements

### 3.1 Authentication

Users can:
- Register with email and password (minimum validation)
- Log in / log out
- Stay authenticated across sessions

Authentication state is accessible on server (for SSR) and on client (for protected UI).

Unauthenticated users:
- Can access public shared note URLs (read-only)
- Cannot access dashboard or personal notes
- Receive 401 response from protected API endpoints

### 3.2 Notes Management (Authenticated)

**Create a new note:**
- Default title: "Untitled note"
- Default empty TipTap document

**View a list of own notes:**
- Show title, last updated at, shared status

**View a single note:**
- Load editor with stored TipTap JSON document

**Update note:**
- Change title
- Change content (TipTap JSON)
- Auto-update `updated_at`

**Delete note:**
- Hard delete from database

### 3.3 Note Sharing

Users can toggle note "public sharing":

**When enabled:**
- Note gets a unique public slug (e.g., `abcdef1234`)
- Accessible via `/p/{slug}` for anonymous users

**When disabled:**
- Public URL returns 404 / "Note not found"

**Public page rendering:**
- Reads note from DB by `public_slug`
- Shows title and content in read-only mode
- No editing or owner information visible

---

## 4. Non-Functional Requirements

**Performance**
- Notes list & note view should load under ~300 ms for typical DB sizes

**Security**
- All note operations are scoped to authenticated user's `user_id`
- Public notes are read-only; no leaked private data in API responses
- Public slugs are sufficiently random (16+ chars) to prevent guessing

**Reliability**
- Graceful handling of DB errors
- Proper error responses (401, 404, 500)

**Maintainability**
- Type-safe APIs and DB types
- Modularized DB and auth helpers

**UX**
- Simple, minimal UI with keyboard-friendly editor
- Clear feedback on share status
- Confirmation before destructive operations (delete)

---

## 5. Data Model & Database Schema (SQLite)

### 5.1 Core Tables

#### better-auth Tables

better-auth manages its own tables for authentication. The following tables are required and managed by better-auth.

**user**

Table Name: `user`

```sql
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified BOOLEAN NOT NULL DEFAULT 0,
  image TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
```

| Field | Type | Description |
|-------|------|-------------|
| id | TEXT | Unique identifier for each user (primary key) |
| name | TEXT | User's chosen display name |
| email | TEXT | User's email address for communication and login |
| emailVerified | BOOLEAN | Whether the user's email is verified |
| image | TEXT | User's profile image URL (optional) |
| createdAt | TEXT | ISO 8601 timestamp of account creation |
| updatedAt | TEXT | ISO 8601 timestamp of last update |

**session**

Table Name: `session`

```sql
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expiresAt TEXT NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);
```

| Field | Type | Description |
|-------|------|-------------|
| id | TEXT | Unique identifier for each session (primary key) |
| userId | TEXT | Reference to the user (foreign key) |
| token | TEXT | The unique session token for authentication |
| expiresAt | TEXT | ISO 8601 timestamp when session expires |
| ipAddress | TEXT | IP address of the device (optional) |
| userAgent | TEXT | User agent string of the device (optional) |
| createdAt | TEXT | ISO 8601 timestamp of session creation |
| updatedAt | TEXT | ISO 8601 timestamp of last session update |

**account**

Table Name: `account`

```sql
CREATE TABLE account (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  accessTokenExpiresAt TEXT,
  refreshTokenExpiresAt TEXT,
  scope TEXT,
  idToken TEXT,
  password TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);
```

| Field | Type | Description |
|-------|------|-------------|
| id | TEXT | Unique identifier for each account (primary key) |
| userId | TEXT | Reference to the user (foreign key) |
| accountId | TEXT | Account ID from provider or same as userId for credentials |
| providerId | TEXT | Provider identifier (e.g., "credential", "google", "github") |
| accessToken | TEXT | OAuth access token from provider (optional) |
| refreshToken | TEXT | OAuth refresh token from provider (optional) |
| accessTokenExpiresAt | TEXT | Expiration time for access token (optional) |
| refreshTokenExpiresAt | TEXT | Expiration time for refresh token (optional) |
| scope | TEXT | OAuth scope from provider (optional) |
| idToken | TEXT | OpenID Connect ID token from provider (optional) |
| password | TEXT | Hashed password (only for email/password auth) |
| createdAt | TEXT | ISO 8601 timestamp of account creation |
| updatedAt | TEXT | ISO 8601 timestamp of last update |

**verification**

Table Name: `verification`

```sql
CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
```

| Field | Type | Description |
|-------|------|-------------|
| id | TEXT | Unique identifier for verification record (primary key) |
| identifier | TEXT | Identifier being verified (e.g., email address) |
| value | TEXT | Verification code or token |
| expiresAt | TEXT | ISO 8601 timestamp when verification expires |
| createdAt | TEXT | ISO 8601 timestamp of verification creation |
| updatedAt | TEXT | ISO 8601 timestamp of last update |

#### Application Tables

**notes**

Application-specific table for storing user notes.

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  contentJson TEXT NOT NULL,
  isPublic INTEGER NOT NULL DEFAULT 0,
  publicSlug TEXT UNIQUE,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);
```

| Field | Type | Description |
|-------|------|-------------|
| id | TEXT | Unique identifier for note (primary key) |
| userId | TEXT | Reference to the note owner (foreign key) |
| title | TEXT | Note title |
| contentJson | TEXT | TipTap document as JSON string |
| isPublic | INTEGER | Whether note is publicly shared (0=false, 1=true) |
| publicSlug | TEXT | Unique slug for public sharing (optional, unique) |
| createdAt | TEXT | ISO 8601 timestamp of note creation |
| updatedAt | TEXT | ISO 8601 timestamp of last note update |

### 5.2 Indexes

```sql
CREATE INDEX idx_notes_userId ON notes(userId);
CREATE INDEX idx_notes_publicSlug ON notes(publicSlug);
CREATE INDEX idx_notes_isPublic ON notes(isPublic);
```

These indexes optimize:
- User's own notes lookup
- Public note lookup by slug
- Public notes discovery

---

## 6. Backend: DB & API Layer

### 6.1 Database Access Module

**File:** `lib/db.ts`

Initialize and export a Bun SQLite client connection with the following functions:

- `getDb()` – returns singleton DB connection
- `query<T>(sql: string, params?: unknown[]): T[]` – execute query, return array of rows
- `get<T>(sql: string, params?: unknown[]): T | undefined` – execute query, return single row or undefined
- `run(sql: string, params?: unknown[]): { changes: number }` – execute insert/update/delete, return affected rows count

**Configuration:**
- Database file path: `data/app.db`
- Enable WAL (Write-Ahead Logging) for better concurrency

### 6.2 Note Repository Functions

**File:** `lib/notes.ts`

**TypeScript types:**

```typescript
export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string; // stringified TipTap JSON document
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};
```

**Repository functions:**

- `createNote(userId: string, data: { title?: string; contentJson?: string }): Promise<Note>`
  - Creates new note with default title "Untitled note" and empty TipTap document if not provided

- `getNoteById(userId: string, noteId: string): Promise<Note | null>`
  - Retrieves note only if owned by user

- `getNotesByUser(userId: string): Promise<Note[]>`
  - Lists all notes owned by user, ordered by updatedAt descending

- `updateNote(userId: string, noteId: string, data: Partial<{ title: string; contentJson: string }>): Promise<Note | null>`
  - Updates note title and/or content, updates updatedAt timestamp

- `deleteNote(userId: string, noteId: string): Promise<void>`
  - Hard delete, only if owned by user

- `setNotePublic(userId: string, noteId: string, isPublic: boolean): Promise<Note | null>`
  - Toggle public sharing; generates random slug if enabling, clears slug if disabling

- `getNoteByPublicSlug(slug: string): Promise<Note | null>`
  - Retrieves public note by slug (checks isPublic = 1)

**Security Note:** Each function enforces `userId = ?` in SQL where applicable to prevent cross-user access.

---

## 7. API Design (Next.js Route Handlers)

Base path: `/api/notes`

### 7.1 Authentication Requirements

Implement server helper function from better-auth (e.g., `auth.api.getSession()` or similar).

All endpoints except public reads must:
- Check authentication
- Return 401 Unauthorized if user is not authenticated
- Return 403 Forbidden if user tries to access another user's note

### 7.2 Protected Endpoints

#### `GET /api/notes`

**Description:** List all notes for current user

**Authentication:** Required

**Response 200:**
```json
[
  {
    "id": "note-123",
    "title": "My First Note",
    "isPublic": true,
    "updatedAt": "2025-01-15T10:30:00Z"
  }
]
```

**Notes:**
- Omit `contentJson` from list for performance
- Order by `updatedAt` descending
- Include `isPublic` status for UI

---

#### `POST /api/notes`

**Description:** Create a new note

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Optional title",
  "contentJson": { "type": "doc", "content": [] }
}
```

**Behavior:**
- If `title` is missing, use "Untitled note"
- If `contentJson` is missing, use empty TipTap document:
  ```json
  { "type": "doc", "content": [] }
  ```

**Response 201:**
```json
{
  "id": "note-456",
  "title": "Optional title",
  "isPublic": false,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

---

#### `GET /api/notes/:id`

**Description:** Get single note by ID

**Authentication:** Required

**URL Parameters:**
- `id` – note ID

**Response 200:**
```json
{
  "id": "note-123",
  "title": "My Note",
  "contentJson": { "type": "doc", "content": [...] },
  "isPublic": false,
  "publicSlug": null,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

**Errors:**
- 404 if note not found or not owned by user

---

#### `PUT /api/notes/:id`

**Description:** Update note title and/or content

**Authentication:** Required

**URL Parameters:**
- `id` – note ID

**Request Body:**
```json
{
  "title": "Updated title",
  "contentJson": { "type": "doc", "content": [...] }
}
```

**Response 200:**
```json
{
  "id": "note-123",
  "title": "Updated title",
  "contentJson": { ... },
  "updatedAt": "2025-01-15T11:00:00Z"
}
```

**Errors:**
- 404 if note not found or not owned by user

**Side Effects:**
- Automatically updates `updatedAt` to current time

---

#### `DELETE /api/notes/:id`

**Description:** Delete note permanently

**Authentication:** Required

**URL Parameters:**
- `id` – note ID

**Response:**
- 204 No Content on success

**Errors:**
- 404 if note not found or not owned by user

---

#### `POST /api/notes/:id/share`

**Description:** Toggle public sharing of note

**Authentication:** Required

**URL Parameters:**
- `id` – note ID

**Request Body:**
```json
{
  "isPublic": true
}
```

**Behavior:**
- If `isPublic = true` and note has no `publicSlug`:
  - Generate unique random slug (16+ characters, URL-safe)
  - Example: `f7a8b9c2d3e4f5g6`
- If `isPublic = false`:
  - Clear `publicSlug` (set to NULL)
  - Clear `isPublic` flag

**Response 200:**
```json
{
  "id": "note-123",
  "isPublic": true,
  "publicSlug": "f7a8b9c2d3e4f5g6"
}
```

**Errors:**
- 404 if note not found or not owned by user

---

### 7.3 Public Endpoints

#### `GET /api/public-notes/:slug`

**Description:** Read-only access to public notes (no authentication required)

**URL Parameters:**
- `slug` – public slug

**Response 200:**
```json
{
  "title": "Public Note",
  "contentJson": { "type": "doc", "content": [...] }
}
```

**Errors:**
- 404 if slug not found or note is not public

**Security Note:**
- Do NOT return user information
- Do NOT return private metadata
- Only return title and contentJson

---

## 8. Frontend – Pages & Components

### 8.1 Routes

Assuming Next.js App Router structure:

**`/`** – Landing/Home Page
- Marketing content
- Call-to-action for "Log in / Sign up"
- Links to public notes (if shared publicly)

**`/dashboard`** – Authenticated Dashboard
- Requires authentication
- List of user's notes
- "Create note" button
- Sort by last updated
- Show public/private status

**`/notes/[id]`** – Note Editor Page
- Requires authentication
- TipTap editor for content
- Title input field
- Share toggle with public URL display
- Delete button with confirmation
- Auto-save indicator

**`/p/[slug]`** – Public Note Viewer
- No authentication required
- Read-only content
- No owner information shown
- Simple, clean design
- Optional back button

### 8.2 Layout & Navigation

**`app/layout.tsx`** – Global Layout
- Header with app name/logo
- Navigation (Home, Dashboard if authenticated)
- Authentication buttons (Login/Signup if not authenticated, Account/Logout if authenticated)
- Dark/Light mode toggle

**`app/(auth)/` Directory** – Auth Routes
- `/login` – Email/password login form
- `/register` – Sign up form
- If better-auth provides UI components, integrate them

**Protected Routes:**
- Wrap `/dashboard` and `/notes` routes with auth check
- Redirect unauthenticated users to `/login`

### 8.3 Components

**`components/NoteList.tsx`**
- Props: `notes: { id: string; title: string; updatedAt: string; isPublic: boolean }[]`
- Renders list with links to `/notes/[id]`
- Shows public/private badge
- Shows last updated time
- "New Note" button at top

**`components/NoteEditor.tsx`**
- Client component with TipTap editor
- Props: `initialContent: any`, `onUpdate: (json: any) => void`
- Controlled by parent
- Optional auto-save with debounce

**`components/NoteToolbar.tsx`**
- Formatting buttons for TipTap:
  - Bold, Italic, Underline
  - Heading 1, 2, 3, Paragraph
  - Bullet list, Ordered list
  - Code block, Inline code
  - Horizontal rule
  - Clear formatting

**`components/ShareToggle.tsx`**
- Toggle switch for `isPublic`
- Shows public URL when enabled
- Copy-to-clipboard button
- Share link display

**`components/DeleteNoteButton.tsx`**
- Button that opens confirmation dialog
- Calls DELETE API
- Redirects to dashboard on success
- Shows error toast on failure

**`components/PublicNoteViewer.tsx`**
- Renders TipTap content in read-only mode
- Props: `contentJson: any`, `title: string`
- Uses `EditorContent` with `editable: false`
- Clean typography styling

**`components/LoadingSpinner.tsx`**
- Generic loading indicator
- Used during API calls

**`components/Toast.tsx`**
- Toast notifications for user feedback
- Success, error, info, warning variants
- Auto-dismiss after 3 seconds

---

## 9. TipTap Integration

### 9.1 Extensions

Enable at minimum:

```typescript
import StarterKit from '@tiptap/starter-kit';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
```

- `StarterKit` – includes paragraphs, headings, bold, italic, lists, etc.
- `Code` – inline code
- `CodeBlock` – code blocks with language support

**Example Editor Configuration:**

```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Code,
    CodeBlock,
  ],
  content: contentJson, // Pass parsed JSON
  onUpdate: ({ editor }) => {
    const json = editor.getJSON();
    onContentChange(json);
  },
});
```

### 9.2 Content Storage

- **In Database:** Store as `JSON.stringify(editorJson)`
- **When Loading:** Parse with `JSON.parse()` and pass to editor
- **On Save:** Call `editor.getJSON()` to get current state

### 9.3 Toolbar

Buttons with icons and keyboard shortcuts:

| Button | Action | Shortcut |
|--------|--------|----------|
| **Bold** | Toggle bold | `Ctrl+B` |
| **Italic** | Toggle italic | `Ctrl+I` |
| **Code** | Toggle inline code | `` Ctrl+` `` |
| **H1** | Heading level 1 | `Ctrl+Alt+1` |
| **H2** | Heading level 2 | `Ctrl+Alt+2` |
| **H3** | Heading level 3 | `Ctrl+Alt+3` |
| **Paragraph** | Normal text | `Ctrl+Alt+0` |
| **Bullet List** | Toggle bullet list | `Ctrl+Shift+U` |
| **Ordered List** | Toggle ordered list | `Ctrl+Shift+O` |
| **Code Block** | Insert code block | |
| **Horizontal Rule** | Insert divider | |
| **Clear** | Clear formatting | |

Example implementation:

```typescript
const editor = useEditor(/* config */);

// Toggle bold
editor.chain().focus().toggleBold().run();

// Toggle heading
editor.chain().focus().toggleHeading({ level: 1 }).run();

// Toggle bullet list
editor.chain().focus().toggleBulletList().run();
```

---

## 10. Styling (TailwindCSS)

### 10.1 Configuration

- Configure Tailwind in `tailwind.config.ts`
- Install `@tailwindcss/typography` for prose styling

### 10.2 Design Principles

- **Minimal, clean aesthetic** – neutral background, white cards
- **Responsive** – mobile-first design
- **Accessible** – proper contrast, focus states, semantic HTML
- **Editor styling:**
  - Light background for editor area
  - Clear visual hierarchy
  - Focus state on inputs
  - Toolbar buttons with hover effects

### 10.3 Color Palette

- **Background:** `bg-slate-50`
- **Cards:** `bg-white`
- **Text:** `text-slate-900`
- **Accent:** `text-blue-600`
- **Borders:** `border-slate-200`

### 10.4 Prose Styling

For read-only public notes, use `prose` class:

```jsx
<div className="prose prose-sm max-w-none">
  <PublicNoteViewer contentJson={note.contentJson} title={note.title} />
</div>
```

---

## 11. Security Considerations

### 11.1 Authentication Enforcement

- All `/dashboard` and `/notes/[id]` routes check authentication on server
- Middleware or layout-level checks prevent unauthorized access
- API routes verify session and return 401 for unauthenticated requests

### 11.2 Authorization

- Every note query in auth context filters by `userId`
- API never returns notes from other users
- SQL: `WHERE user_id = ?` with parameterized queries

### 11.3 Public Notes

- Slugs are randomly generated (16+ characters)
- Use URL-safe characters (alphanumeric, no special chars)
- Example slug generator: `nanoid(16)` or `crypto.randomUUID().slice(0, 16)`
- Public notes only expose title and content, no owner info

### 11.4 Content Security

- **Primary data is TipTap JSON**, not raw HTML
- When rendering, use TipTap's `EditorContent` component with `editable: false`
- Never use `dangerouslySetInnerHTML` with note content
- Input validation on title and API payloads

### 11.5 Database Security

- Use parameterized queries (`:params` or `?` placeholders)
- Never concatenate user input into SQL strings
- Validate and sanitize API inputs
- Handle DB errors gracefully without exposing schema details

### 11.6 Rate Limiting (Optional Enhancement)

- Consider per-IP or per-user rate limiting on public endpoints
- Especially for public note access and API creation

---

## 12. Development Workflow

### Phase 1: Project Setup
1. Initialize Next.js with Bun and TypeScript
2. Install dependencies (TipTap, better-auth, TailwindCSS)
3. Set up TailwindCSS configuration
4. Initialize SQLite database file

### Phase 2: Backend Foundation
1. Implement database module (`lib/db.ts`)
2. Create database schema (user, session, account, verification, notes tables)
3. Set up better-auth integration and middleware
4. Build note repository functions (`lib/notes.ts`)

### Phase 3: Authentication
1. Integrate better-auth with Next.js
2. Implement sign up and login endpoints
3. Create login/register pages
4. Set up auth middleware and protected routes

### Phase 4: Note API
1. Implement `/api/notes` CRUD endpoints
2. Implement `/api/notes/:id/share` sharing endpoint
3. Implement `/api/public-notes/:slug` public endpoint
4. Add proper error handling and validation

### Phase 5: Frontend - Core Pages
1. Create dashboard page (`/dashboard`) with note list
2. Create note editor page (`/notes/[id]`)
3. Create public note viewer page (`/p/[slug]`)
4. Implement navigation and layout

### Phase 6: Frontend - Components & Styling
1. Build TipTap editor component with toolbar
2. Implement share toggle and delete button
3. Add TailwindCSS styling
4. Add loading states and error messages

### Phase 7: Polish & Testing
1. Add auto-save functionality
2. Implement toast notifications
3. Add loading spinners and feedback
4. Manual testing of full user flows
5. Test public sharing
6. Test error cases (404, unauthorized access)

---

## 13. Database Setup & Migrations

### 13.1 Initial Setup

**Steps:**
1. Create `data/` directory
2. Run better-auth CLI to generate schema: `npx auth@latest generate`
3. Create `notes` table with indexes
4. Verify all tables exist in SQLite

**Script Example (`scripts/init-db.ts`):**

```typescript
import Database from "bun:sqlite";
import { sql } from "@/lib/db";

const db = new Database("data/app.db");

// Create tables
db.exec(sql`/* user, session, account, verification tables from better-auth */`);

// Create notes table
db.exec(sql`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    title TEXT NOT NULL,
    contentJson TEXT NOT NULL,
    isPublic INTEGER NOT NULL DEFAULT 0,
    publicSlug TEXT UNIQUE,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
  )
`);

// Create indexes
db.exec(sql`CREATE INDEX IF NOT EXISTS idx_notes_userId ON notes(userId)`);
db.exec(sql`CREATE INDEX IF NOT EXISTS idx_notes_publicSlug ON notes(publicSlug)`);
db.exec(sql`CREATE INDEX IF NOT EXISTS idx_notes_isPublic ON notes(isPublic)`);

db.close();
```

### 13.2 Running Migrations

For development:
```bash
bun run scripts/init-db.ts
```

For production, consider:
- Using better-auth's CLI migrate command
- Version control your migrations
- Test migrations on staging database

---

## 14. Environment Variables

**.env.local** (local development)

```env
# Better Auth
AUTH_SECRET=your-secret-key-here
AUTH_URL=http://localhost:3000

# Database
DATABASE_URL=file:./data/app.db
```

**.env.production** (production)

```env
AUTH_SECRET=<generate-secure-secret>
AUTH_URL=https://yourdomain.com

DATABASE_URL=file:/data/app.db
```

---

## 15. Key Implementation Notes

- **Type Safety:** Use TypeScript throughout; leverage better-auth's type inference
- **Error Handling:** Return proper HTTP status codes; log errors server-side
- **Performance:** Add indexes on frequently queried columns; consider pagination for large note lists
- **Accessibility:** Use semantic HTML; ensure keyboard navigation works throughout
- **Testing:** Write tests for API endpoints and critical user flows (create note, share, delete)

