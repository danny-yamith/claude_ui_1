"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";

interface Props {
  contentJson: string;
}

export default function PublicNoteViewer({ contentJson }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Code,
      CodeBlock,
    ],
    content: JSON.parse(contentJson),
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="prose prose-sm max-w-none">
      <EditorContent editor={editor} />
    </div>
  );
}
