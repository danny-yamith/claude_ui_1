import { auth } from "@/lib/auth";
import { getNoteById, updateNote, deleteNote } from "@/lib/notes";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const note = await getNoteById(session.user.id, id);
  if (!note) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(note);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const note = await updateNote(session.user.id, id, {
    title: body.title,
    contentJson: body.contentJson,
  });

  if (!note) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(note);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getNoteById(session.user.id, id);
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await deleteNote(session.user.id, id);
  return Response.json(null, { status: 204 });
}
