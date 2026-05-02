# CLAUDE.md

we're building the app described in  @public/SPEC.md . Read that file for general architectural task or to double-check the exact database structure , tech stack or application architecture.

Keep ypu replies extremly concise and focus on conveying the key information. No unnecesary fluff, no long code snippets.

whwnever working with any third-party library or something similar , you MUST look up the official documentation to ensure that you're working up-to-date information. 
Use the DocExplorer subagent for efficvent documentation lookup. 

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack note-taking web application built with Next.js (App Router) using TypeScript, TailwindCSS, TipTap for rich-text editing, better-auth for authentication, and Bun's SQLite as the database. Users can create, edit, delete, and publicly share notes with rich formatting.

## Development Setup

**Runtime:** Bun
- Install dependencies: `bun install`
- Development server: `bun run dev` (starts on `http://localhost:3000`)
- Production build: `bun run build && bun start`
- Linting: `bun run lint`

**Database:** SQLite stored at `data/app.db` (file-based, managed via Bun's SQLite client)
- Database is auto-initialized on first run
- Connection uses Write-Ahead Logging (WAL) for concurrency

**Environment Variables:** Copy `.env.example` to `.env.local` and configure:
- `BETTER_AUTH_SECRET` – authentication secret (32+ characters)
- `AUTH_URL` – app URL for auth (e.g., `http://localhost:3000`)
- `DB_PATH` – database path (default: `data/app.db`)

## Architecture Overview

### Database Layer
**File:** `lib/db.ts`
- Bun SQLite connection wrapper
- Exports: `getDb()`, `query<T>()`, `get<T>()`, `run()`
- Tables: `user`, `session`, `account`, `verification` (managed by better-auth) and custom `notes` table
- Indexes on `notes(userId)`, `notes(publicSlug)`, `notes(isPublic)` for query performance

**File:** `lib/notes.ts`
- Repository functions for note CRUD: `createNote()`, `getNoteById()`, `getNotesByUser()`, `updateNote()`, `deleteNote()`, `setNotePublic()`, `getNoteByPublicSlug()`
- All functions enforce user ownership via `WHERE userId = ?` to prevent cross-user access
- Public slugs are randomly generated (16+ characters) using URL-safe characters

### API Layer
**Base path:** `/api/notes`

**Protected endpoints** (require authentication):
- `GET /api/notes` – list user's notes (excludes `contentJson` for performance)
- `POST /api/notes` – create note with optional title and contentJson
- `GET /api/notes/:id` – fetch single note with full content
- `PUT /api/notes/:id` – update title and/or content
- `DELETE /api/notes/:id` – hard delete
- `POST /api/notes/:id/share` – toggle public sharing, generates/clears slug

**Public endpoints** (no authentication required):
- `GET /api/public-notes/:slug` – read-only access to shared notes (returns only title and contentJson)

### Frontend Structure
**Pages:**
- `/` – landing page with marketing content and auth buttons
- `/dashboard` – authenticated user's note list
- `/notes/[id]` – note editor with TipTap, title input, share toggle, delete button
- `/p/[slug]` – public read-only note viewer (no authentication required)
- `/(auth)/login` and `/(auth)/register` – authentication forms (via better-auth)

**Key Components:**
- `NoteEditor.tsx` – TipTap editor with toolbar (client component)
- `NoteToolbar.tsx` – formatting buttons (Bold, Italic, H1-H3, Code, Lists, etc.)
- `ShareToggle.tsx` – toggle public sharing with slug display
- `NoteList.tsx` – user's notes with metadata and "New Note" button
- `PublicNoteViewer.tsx` – read-only content renderer with prose styling

### Authentication
- **Library:** better-auth
- **Session storage:** SQLite tables managed by better-auth
- **Server-side helpers:** `auth.api.getSession()` pattern (exact API depends on better-auth version)
- Protected routes redirect unauthenticated users to `/login`
- API endpoints return 401 for missing auth, 403 for access to other users' notes

## TipTap Editor Configuration

**Extensions enabled:**
- `StarterKit` (includes headings H1-H3, bold, italic, lists, blockquotes, code blocks)
- `Code` (inline code)
- `CodeBlock` (code blocks with language support)

**Content format:** TipTap JSON document stored as stringified JSON in database
- Example: `{ "type": "doc", "content": [...] }`
- On client: parse with `JSON.parse()` and pass to editor
- On save: call `editor.getJSON()` to serialize

**Toolbar shortcuts:** Standard keyboard shortcuts (Ctrl+B for bold, Ctrl+I for italic, etc.)

## Key Implementation Details

### Type Safety
- TypeScript strict mode enabled in `tsconfig.json`
- Path alias `@/*` maps to project root for cleaner imports
- Better-auth provides type inference for session data

### Styling
- **Framework:** TailwindCSS 4 with PostCSS
- **Color scheme:** Neutral palette (slate-50 background, slate-900 text, blue-600 accent)
- **Prose styling:** `@tailwindcss/typography` for read-only note display
- **Responsive:** Mobile-first design

### Security
- **SQL Injection:** Parameterized queries only (no string concatenation)
- **Public slugs:** Generated with 16+ URL-safe characters to prevent guessing
- **Public notes:** Only title and contentJson exposed; no user information
- **Authorization:** Every query filtered by `userId` to prevent cross-user access
- **Content:** TipTap JSON stored as-is (never raw HTML); rendered with `EditorContent` component

### Data Model
**notes table:**
- `id` (TEXT PRIMARY KEY)
- `userId` (TEXT, foreign key to user.id, ON DELETE CASCADE)
- `title` (TEXT)
- `contentJson` (TEXT, stringified TipTap document)
- `isPublic` (INTEGER, 0 or 1)
- `publicSlug` (TEXT UNIQUE, nullable)
- `createdAt`, `updatedAt` (TEXT, ISO 8601 timestamps)

## Common Commands

```bash
# Development
bun run dev           # Start dev server

# Linting & Type Checking
bun run lint          # Run ESLint

# Database
# (Auto-initialized; manual schema setup not required for development)
bun scripts/init-db.ts  # (if available) Initialize schema

# Building
bun run build         # Production build
bun start             # Start production server
```

## Testing & Debugging

- **Type checking:** Run `tsc --noEmit` to verify TS compilation
- **Linting:** `bun run lint` checks code quality
- **Manual testing:** Start dev server and test note CRUD flows, sharing, and public access
- **Error states:** Test 404 (missing notes), 401 (unauthenticated), 403 (cross-user access)

## Notes for Future Development

- **Auto-save:** Can be added to note editor with debounced API calls
- **Pagination:** Note list pagination for many notes (add `limit` and `offset` to `GET /api/notes`)
- **Search:** Full-text search on title/content with index optimization
- **Rate limiting:** Per-IP or per-user limits on public endpoints (optional security enhancement)
- **Real-time collaboration:** Requires WebSocket layer and operational transformation
- **Rich media:** Note extension for images/attachments
- **Dark mode:** TailwindCSS dark mode class support via theme toggle
- **Export:** PDF or Markdown export of notes
