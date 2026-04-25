"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import NoteEditor from "@/components/NoteEditor";

interface Note {
  id: string;
  title: string;
  contentJson: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    fetchNote();
  }, [noteId]);

  async function fetchNote() {
    try {
      const res = await fetch(`/api/notes/${noteId}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      setNote(data);
      setTitle(data.title);
      setContent(JSON.parse(data.contentJson));
      setIsPublic(data.isPublic);
      if (data.isPublic && data.publicSlug) {
        setPublicUrl(`${window.location.origin}/p/${data.publicSlug}`);
      }
    } catch (err) {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function saveNote() {
    if (!note) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          contentJson: JSON.stringify(content),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated = await res.json();
      setNote(updated);
    } catch (err) {
      alert("Failed to save note");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublic() {
    if (!note) return;
    try {
      const res = await fetch(`/api/notes/${noteId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      if (!res.ok) throw new Error("Failed to update sharing");
      const updated = await res.json();
      setIsPublic(updated.isPublic);
      if (updated.isPublic && updated.publicSlug) {
        setPublicUrl(`${window.location.origin}/p/${updated.publicSlug}`);
      } else {
        setPublicUrl("");
      }
    } catch (err) {
      alert("Failed to update sharing");
    }
  }

  async function deleteNote() {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/dashboard");
    } catch (err) {
      alert("Failed to delete note");
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  if (!note) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              ← Back
            </Link>
            <div className="flex gap-2">
              <button
                onClick={saveNote}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={deleteNote}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-bold text-slate-900 bg-transparent border-none focus:outline-none"
            placeholder="Untitled note"
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={togglePublic}
              className="w-4 h-4"
            />
            <span className="text-slate-900 font-medium">Make public</span>
          </label>
          {publicUrl && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-700 mb-2">
                Public link:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={publicUrl}
                  readOnly
                  className="flex-1 px-2 py-1 bg-white border border-green-300 rounded text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl);
                    alert("Copied!");
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {content && (
          <NoteEditor content={content} onChange={setContent} />
        )}
      </main>
    </div>
  );
}
