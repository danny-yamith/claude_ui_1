import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-slate-900 hover:text-slate-700 transition-colors">
          NextNotes
        </Link>
      </div>
    </header>
  );
}
