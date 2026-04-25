import { getNoteByPublicSlug } from "@/lib/notes";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const note = await getNoteByPublicSlug(slug);
  if (!note) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({
    title: note.title,
    contentJson: note.contentJson,
  });
}
