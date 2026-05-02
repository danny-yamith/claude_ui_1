import { notFound } from "next/navigation";
import { getNoteByPublicSlug } from "@/lib/notes";
import PublicNoteViewer from "@/components/PublicNoteViewer";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicNotePage({ params }: Props) {
  const { slug } = await params;
  const note = await getNoteByPublicSlug(slug);

  if (!note) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">{note.title}</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <PublicNoteViewer contentJson={note.contentJson} />
        </div>
      </main>
    </div>
  );
}
