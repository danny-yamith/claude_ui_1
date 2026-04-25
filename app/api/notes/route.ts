import { auth } from "@/lib/auth";
import {
  createNote,
  getNotesByUser,
} from "@/lib/notes";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const notes = await getNotesByUser(session.user.id);
  return Response.json(
    notes.map((n) => ({
      id: n.id,
      title: n.title,
      isPublic: n.isPublic,
      updatedAt: n.updatedAt,
    }))
  );
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const note = await createNote(session.user.id, {
    title: body.title,
    contentJson: body.contentJson,
  });

  return Response.json(note, { status: 201 });
}
