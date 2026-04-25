"use client";

import { Editor } from "@tiptap/react";

interface NoteToolbarProps {
  editor: Editor;
}

export default function NoteToolbar({ editor }: NoteToolbarProps) {
  const buttons = [
    {
      label: "Bold",
      onClick: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      label: "Italic",
      onClick: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      label: "Code",
      onClick: () => editor.chain().focus().toggleCode().run(),
      active: editor.isActive("code"),
    },
    { label: "|", disabled: true },
    {
      label: "H1",
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive("heading", { level: 1 }),
    },
    {
      label: "H2",
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "H3",
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    {
      label: "P",
      onClick: () => editor.chain().focus().setParagraph().run(),
      active: editor.isActive("paragraph"),
    },
    { label: "|", disabled: true },
    {
      label: "•",
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      label: "1.",
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      label: "Code Block",
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      active: editor.isActive("codeBlock"),
    },
    {
      label: "—",
      onClick: () => editor.chain().focus().setHorizontalRule().run(),
      disabled: false,
    },
    { label: "|", disabled: true },
    {
      label: "Clear",
      onClick: () => editor.chain().focus().clearNodes().run(),
      disabled: false,
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-slate-100 border-b border-slate-300">
      {buttons.map((btn, idx) => (
        btn.label === "|" ? (
          <div key={idx} className="w-px bg-slate-300 mx-1" />
        ) : (
          <button
            key={idx}
            onClick={btn.onClick}
            disabled={btn.disabled}
            className={`px-2 py-1 rounded text-sm font-medium transition ${
              btn.active
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-900 hover:bg-slate-200"
            } ${btn.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {btn.label}
          </button>
        )
      ))}
    </div>
  );
}
