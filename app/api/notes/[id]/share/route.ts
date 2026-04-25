import { auth } from "@/lib/auth";
import { setNotePublic } from "@/lib/notes";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const note = await setNotePublic(session.user.id, id, body.isPublic);

  if (!note) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({
    id: note.id,
    isPublic: note.isPublic,
    publicSlug: note.publicSlug,
  });
}
