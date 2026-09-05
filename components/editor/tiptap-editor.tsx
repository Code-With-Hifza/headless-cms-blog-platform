"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import { useState, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Table as TableIcon,
  Undo,
  Redo,
  CheckCircle2,
  Clock,
  Sparkles,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { countWords, calculateReadingTime } from "@/lib/utils";

interface TiptapEditorProps {
  content: string;
  postId?: string;
  onChange: (html: string) => void;
  onAutoSave?: (html: string) => Promise<void>;
  placeholder?: string;
}

export function TiptapEditor({
  content,
  postId,
  onChange,
  onAutoSave,
  placeholder = "Write your masterpiece...",
}: TiptapEditorProps) {
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [stats, setStats] = useState({ words: 0, readingTime: 1 });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-sky-600 underline hover:text-sky-800",
        },
      }),
      Youtube.configure({
        controls: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose-content min-h-[350px] w-full focus:outline-none p-4 rounded-b-lg",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      const words = countWords(html);
      setStats({
        words,
        readingTime: calculateReadingTime(html),
      });
      setSaveStatus("idle");
    },
  });

  // Debounced auto-save effect
  useEffect(() => {
    if (!editor || !onAutoSave || !postId) return;

    const timer = setTimeout(async () => {
      const currentHtml = editor.getHTML();
      if (currentHtml && currentHtml !== content) {
        setSaveStatus("saving");
        try {
          await onAutoSave(currentHtml);
          setSaveStatus("saved");
          setLastSavedTime(new Date().toLocaleTimeString());
        } catch (err) {
          console.error("Auto-save error:", err);
          setSaveStatus("idle");
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [editor?.getHTML(), onAutoSave, postId]);

  const addImage = useCallback(() => {
    const url = window.prompt("Enter Image URL (or select from Media Library):");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addYoutube = useCallback(() => {
    const url = window.prompt("Enter YouTube Video URL:");
    if (url && editor) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter Link URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-2 text-muted-foreground">
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 p-0"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("underline") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className="h-8 w-8 p-0"
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="h-8 w-8 p-0"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="h-8 w-8 p-0"
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="h-8 w-8 p-0"
          title="Quote Block"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("codeBlock") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className="h-8 w-8 p-0"
          title="Code Snippet"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("link") ? "secondary" : "ghost"}
          onClick={setLink}
          className="h-8 w-8 p-0"
          title="Insert Link"
        >
          <Link2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={addImage}
          className="h-8 w-8 p-0"
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={addYoutube}
          className="h-8 w-8 p-0"
          title="Embed YouTube Video"
        >
          <YoutubeIcon className="h-4 w-4 text-red-500" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          className="h-8 w-8 p-0"
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 p-0"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8 p-0"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 bg-background">
        <EditorContent editor={editor} />
      </div>

      {/* Editor Status Bar */}
      <div className="flex flex-wrap items-center justify-between border-t border-border bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-sky-500" />
            {stats.words} words
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            ~{stats.readingTime} min read
          </span>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="text-amber-500 animate-pulse font-medium">
              Saving draft...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved at {lastSavedTime}
            </span>
          )}
          {saveStatus === "idle" && lastSavedTime && (
            <span>Last saved {lastSavedTime}</span>
          )}
        </div>
      </div>
    </div>
  );
}
