"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import Header from "@/components/Header";
import { signOut } from "@/lib/auth-client";

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
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) {
      router.push("/authenticate?mode=login");
      return;
    }
    fetchNotes();
  }, [session, router]);

  async function fetchNotes() {
    try {
      const res = await fetch("/api/notes");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/authenticate?mode=login");
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

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex gap-4">
            <Link
              href="/notes/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              + New Note
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
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
