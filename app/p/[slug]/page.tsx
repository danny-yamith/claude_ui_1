"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";

interface PublicNote {
  title: string;
  contentJson: string;
}

export default function PublicNotePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [note, setNote] = useState<PublicNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Code,
      CodeBlock,
    ],
    editable: false,
    immediatelyRender: false,
  });

  useEffect(() => {
    fetchNote();
  }, [slug]);

  useEffect(() => {
    if (note && editor) {
      editor.commands.setContent(JSON.parse(note.contentJson));
    }
  }, [note, editor]);

  async function fetchNote() {
    try {
      const res = await fetch(`/api/public-notes/${slug}`);
      if (!res.ok) {
        setError("Note not found");
        return;
      }
      const data = await res.json();
      setNote(data);
    } catch (err) {
      setError("Failed to load note");
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {error}
          </h1>
          <p className="text-slate-600">
            This note does not exist or has been made private.
          </p>
        </div>
      </div>
    );

  if (!note) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">
          {note.title}
        </h1>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="prose prose-sm max-w-none">
            {editor && <EditorContent editor={editor} />}
          </div>
        </div>
      </main>
    </div>
  );
}
