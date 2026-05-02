"use client";

import { Editor } from "@tiptap/react";

interface NoteToolbarProps {
  editor: Editor;
}

export default function NoteToolbar({ editor }: NoteToolbarProps) {
  const buttons = [
    {
      id: "bold",
      label: "B",
      title: "Bold (Ctrl+B)",
      onClick: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
      icon: "𝐁",
    },
    {
      id: "italic",
      label: "I",
      title: "Italic (Ctrl+I)",
      onClick: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
      icon: "𝐼",
    },
    {
      id: "code",
      label: "`",
      title: "Inline Code (Ctrl+`)",
      onClick: () => editor.chain().focus().toggleCode().run(),
      active: editor.isActive("code"),
    },
    { divider: true },
    {
      id: "h1",
      label: "H1",
      title: "Heading 1 (Ctrl+Alt+1)",
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive("heading", { level: 1 }),
    },
    {
      id: "h2",
      label: "H2",
      title: "Heading 2 (Ctrl+Alt+2)",
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      id: "h3",
      label: "H3",
      title: "Heading 3 (Ctrl+Alt+3)",
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    {
      id: "paragraph",
      label: "P",
      title: "Paragraph (Ctrl+Alt+0)",
      onClick: () => editor.chain().focus().setParagraph().run(),
      active: editor.isActive("paragraph"),
    },
    { divider: true },
    {
      id: "bullet-list",
      label: "•",
      title: "Bullet List (Ctrl+Shift+U)",
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      id: "ordered-list",
      label: "1.",
      title: "Ordered List (Ctrl+Shift+O)",
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      id: "code-block",
      label: "<>",
      title: "Code Block",
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      active: editor.isActive("codeBlock"),
    },
    {
      id: "hr",
      label: "—",
      title: "Horizontal Rule",
      onClick: () => editor.chain().focus().setHorizontalRule().run(),
      active: false,
    },
    { divider: true },
    {
      id: "clear",
      label: "Clear",
      title: "Clear Formatting",
      onClick: () => editor.chain().focus().clearNodes().run(),
      active: false,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 bg-slate-100 border-b border-slate-300">
      {buttons.map((btn, idx) =>
        "divider" in btn ? (
          <div key={idx} className="w-px h-6 bg-slate-300 mx-0.5" />
        ) : (
          <button
            key={btn.id}
            onClick={btn.onClick}
            title={btn.title}
            aria-pressed={btn.active}
            className={`px-2.5 py-1.5 rounded text-sm font-semibold transition-colors ${
              btn.active
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-900 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {btn.icon || btn.label}
          </button>
        )
      )}
    </div>
  );
}
