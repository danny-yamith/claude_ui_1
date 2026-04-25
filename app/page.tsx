import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Notes</h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-24">
        <section className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Simple, Fast Note Taking
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Create beautiful notes with rich formatting. Share them publicly with a single click.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg"
          >
            Get Started
          </Link>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Rich Editing</h3>
            <p className="text-slate-600">
              Format your notes with bold, italic, headings, code blocks, and lists.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Easy Sharing</h3>
            <p className="text-slate-600">
              Toggle public sharing and generate a unique link to share your notes.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Always Yours</h3>
            <p className="text-slate-600">
              Your notes are private by default. Only you can see them.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
