"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import Header from "@/components/Header";
import NoteEditor from "@/components/NoteEditor";

export default function NewNotePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!session) {
    router.push("/authenticate?mode=login");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Untitled note",
          contentJson: JSON.stringify(content || { type: "doc", content: [] }),
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/authenticate?mode=login");
          return;
        }
        throw new Error("Failed to create note");
      }

      const note = await res.json();
      router.push(`/notes/${note.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm font-medium">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Create New Note</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-900 mb-2">
                Note Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title (optional)"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
              />
              <p className="mt-1 text-xs text-slate-500">Leave empty for "Untitled note"</p>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-slate-900 mb-2">
                Content
              </label>
              <div id="content" className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <NoteEditor content={content} onChange={setContent} />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
              >
                {loading ? "Creating..." : "Create Note"}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-2.5 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
