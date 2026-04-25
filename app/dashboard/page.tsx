"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Note {
  id: string;
  title: string;
  isPublic: boolean;
  updatedAt: string;
}

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const res = await fetch("/api/notes");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch notes");
      }
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  async function createNote() {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to create note");
      const note = await res.json();
      router.push(`/notes/${note.id}`);
    } catch (err) {
      setError("Failed to create note");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Notes</h1>
          <div className="flex gap-4">
            <button
              onClick={createNote}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              + New Note
            </button>
            <Link
              href="/logout"
              className="px-4 py-2 text-slate-600 hover:text-slate-900"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-600">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No notes yet</p>
            <button
              onClick={createNote}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Create your first note
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-slate-900">{note.title}</h2>
                    <p className="text-sm text-slate-500">
                      {new Date(note.updatedAt).toISOString().slice(0, 10)}
                    </p>
                  </div>
                  {note.isPublic && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                      Public
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
