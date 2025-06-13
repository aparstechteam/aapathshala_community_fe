import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { suggestion } from "./extentions/suggestions";
import Mention from "@tiptap/extension-mention";
import HardBreak from "@tiptap/extension-hard-break";
import Paragraph from "@tiptap/extension-paragraph";

interface EditorProps {
  content?: string;
  onUpdate?: (content: string) => void;
}

export const RtxEditor: React.FC<EditorProps> = ({
  content = "",
  onUpdate,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: false,
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          className: "aa",
        },
      }),
      Paragraph,
      Underline,
      Bold,
      Italic,
      BulletList,
      OrderedList,
      ListItem,
      Mention.configure({
        HTMLAttributes: { class: "mention" },
        suggestion,
      }),
      HardBreak.extend({
        addKeyboardShortcuts() {
          return {
            Enter: () => this.editor.commands.setHardBreak(),
          };
        },
      }),
      // Hashtag.configure({
      //     HTMLAttributes: {
      //         tag: 'a',
      //         class: 'custom-hashtag',
      //     },
      // }),
    ],
    content,
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getHTML());
      }
    },
  });

  return (
    <div className="grid gap-1">
      <div className="mb-2 flex gap-2 text-ice">
        <button
          className="bg-ice/20 hover:bg-ice/40 duration-200 focus:!bg-ice focus:text-white w-8 px-2 py-0.5 rounded-lg font-bold"
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor?.can().chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          className="bg-ice/20 hover:bg-ice/40 w-8 duration-200 focus:!bg-ice focus:text-white font-semibold px-2 py-0.5 rounded-lg italic"
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor?.can().chain().focus().toggleItalic().run()}
        >
          i
        </button>
        <button
          className="bg-ice/20 hover:bg-ice/40 duration-200 focus:!bg-ice focus:text-white w-8 px-2 py-0.5 rounded-lg underline"
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          disabled={!editor?.can().chain().focus().toggleUnderline().run()}
        >
          U
        </button>
        {/* <button className="bg-ice/20 hover:bg-ice/40 duration-200 focus:!bg-ice focus:text-white w-10 px-2 py-0.5 rounded-lg" type="button"
                    onClick={() => editor?.chain().focus().toggleCode().run()} disabled={!editor?.can().chain().focus().toggleCode().run()}>
                    {'</>'}
                </button> */}
        {/* <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} disabled={!editor?.can().chain().focus().toggleBulletList().run()}>
                    Bullet List
                </button>
                <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} disabled={!editor?.can().chain().focus().toggleOrderedList().run()}>
                    Ordered List
                </button> */}
      </div>
      <EditorContent
        className="tiptap border-0 relative z-[9] tiptap max-h-[200px] overflow-y-auto aa focus:!outline-none !outline-none focus:!border-0 ring-2 ring-ash focus-within:ring-hot/50 focus:ring-2 focus-within:!ring-2 !rounded-lg"
        editor={editor}
      />
    </div>
  );
};
