'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Heading from '@tiptap/extension-heading';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Bold,
      Italic,
      Underline,
      Heading.configure({ levels: [2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  const applyFormat = (command: string) => {
    switch (command) {
      case 'bold':
        editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'underline':
        editor.chain().focus().toggleUnderline().run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'heading3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white text-black rounded-md border border-white/10">
      <div className="flex flex-wrap gap-2 p-2 border-b border-gray-300">
        <button onClick={() => applyFormat('bold')} className="text-sm font-bold">B</button>
        <button onClick={() => applyFormat('italic')} className="text-sm italic">I</button>
        <button onClick={() => applyFormat('underline')} className="text-sm underline">U</button>
        <button onClick={() => applyFormat('heading2')} className="text-sm">H2</button>
        <button onClick={() => applyFormat('heading3')} className="text-sm">H3</button>
        <button onClick={() => applyFormat('bulletList')} className="text-sm">• List</button>
        <button onClick={() => applyFormat('orderedList')} className="text-sm">1. List</button>
      </div>
      <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[200px]" />
    </div>
  );
}
