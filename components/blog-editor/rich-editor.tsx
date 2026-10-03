"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import { DiagramCodeBlock } from "./diagram-code-block";
import { pastedMermaid } from "@/lib/blog/mermaid-source";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import type { RichNode } from "@/lib/blog/schema";
import { safeUrl } from "@/lib/blog/schema";
import { BlogIcon } from "@/components/blog-admin/ui";
import { BlogDialog } from "@/components/blog-admin/dialog";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { useState } from "react";
export function RichEditor({
  body,
  onChange,
  onImage,
}: {
  body: RichNode;
  onChange: (b: RichNode) => void;
  onImage: () => Promise<string | null>;
}) {
  const [link, setLink] = useState<string | null>(null),
    [linkError, setLinkError] = useState("");
  const [image, setImage] = useState<{ src: string; alt: string } | null>(null);
  const [diagram, setDiagram] = useState<string | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        codeBlock: false,
        link: { openOnClick: false },
      }),
      Image,
      DiagramCodeBlock,
    ],
    content: body,
    immediatelyRender: false,
    editorProps: {
      handlePaste: (view, event) => {
        const source = pastedMermaid(event.clipboardData?.getData("text/plain") ?? "");
        if (!source) return false;
        const node = view.state.schema.nodes.codeBlock.create({ language: "mermaid" }, view.state.schema.text(source));
        view.dispatch(view.state.tr.replaceSelectionWith(node).scrollIntoView());
        return true;
      },
      attributes: {
        role: "textbox",
        "aria-label": "Nội dung bài viết",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as RichNode),
  });
  if (!editor)
    return (
      <div className="state-card" role="status">
        <div className="skeleton" />
        <div className="skeleton short" />
        <p>Đang mở trình soạn thảo…</p>
      </div>
    );
  return (
    <>
      <div className="formatbar" role="toolbar" aria-label="Định dạng nội dung">
        <select
          aria-label="Kiểu đoạn văn"
          value={
            editor.isActive("heading", { level: 2 })
              ? "2"
              : editor.isActive("heading", { level: 3 })
                ? "3"
                : "p"
          }
          onChange={(e) => {
            if (e.target.value === "p")
              editor.chain().focus().setParagraph().run();
            else
              editor
                .chain()
                .focus()
                .toggleHeading({ level: Number(e.target.value) as 2 | 3 })
                .run();
          }}
        >
          <option value="p">Văn bản</option>
          <option value="2">Tiêu đề H2</option>
          <option value="3">Tiêu đề H3</option>
        </select>
        <span className="divider" />
        <button
          type="button"
          aria-label="In đậm"
          aria-pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          aria-label="In nghiêng"
          aria-pressed={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          aria-label="Liên kết"
          onClick={() => {
            setLinkError("");
            setLink(String(editor.getAttributes("link").href ?? ""));
          }}
        >
          <BlogIcon name="link" size={15} />
        </button>
        <span className="divider" />
        <button
          type="button"
          aria-label="Danh sách"
          aria-pressed={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <BlogIcon name="list" size={16} />
        </button>
        <button
          type="button"
          aria-label="Trích dẫn"
          aria-pressed={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <BlogIcon name="quote" size={15} />
        </button>
        <button
          type="button"
          aria-label="Code"
          aria-pressed={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <BlogIcon name="code" size={16} />
        </button>
        <span className="divider" />
        <button
          type="button"
          aria-label="Chèn ảnh hoặc GIF"
          onClick={async () => {
            const src = await onImage();
            if (src) {
              setImage({ src, alt: "" });
            }
          }}
        >
          <BlogIcon name="image" size={16} />
        </button>
        <button
          type="button"
          aria-label="Hoàn tác"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <BlogIcon name="history" size={16} />
        </button>
        <button
          type="button"
          aria-label="Làm lại"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <span style={{ display: "inline-flex", transform: "scaleX(-1)" }}>
            <BlogIcon name="history" size={16} />
          </span>
        </button>
      </div>
      <button type="button" className="button small" onClick={() => setDiagram("flowchart LR\n  A[Ý tưởng] --> B[Thực hiện] --> C[Kết quả]")}>Chèn sơ đồ Mermaid</button>
      {diagram !== null && <BlogDialog title="Sơ đồ Mermaid" onClose={() => setDiagram(null)}>
        <label>Mã sơ đồ<textarea value={diagram} maxLength={10000} rows={8} onChange={(e) => setDiagram(e.target.value)} /></label>
        <MermaidDiagram source={diagram} />
        <button type="button" className="button primary" disabled={!diagram.trim()} onClick={() => {
          editor.chain().focus().insertContent({ type: "codeBlock", attrs: { language: "mermaid" }, content: [{ type: "text", text: diagram }] }).run();
          setDiagram(null);
        }}>Chèn sơ đồ</button>
      </BlogDialog>}
      <div className="editor-prose">
        <EditorContent editor={editor} />
      </div>
      {image && (
        <BlogDialog
          title="Thêm ảnh vào bài"
          iconClose
          onClose={() => setImage(null)}
        >
          {/* Uploaded image is private until the article is published. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            style={{
              maxWidth: "100%",
              maxHeight: 220,
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              editor.chain().setImage(image).run();
              setImage(null);
            }}
          >
            <div className="field">
              <label>
                Mô tả ảnh
                <input
                  autoFocus
                  value={image.alt}
                  onChange={(e) => setImage({ ...image, alt: e.target.value })}
                  maxLength={300}
                  placeholder="Mô tả nội dung ảnh cho người đọc"
                />
              </label>
            </div>
            <p className="private-note">
              Mô tả giúp người dùng trình đọc màn hình hiểu nội dung ảnh.
            </p>
            <button className="button primary">Chèn ảnh</button>
          </form>
        </BlogDialog>
      )}
      {link !== null && (
        <BlogDialog title="Chèn liên kết" onClose={() => setLink(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!link) {
                editor.chain().unsetLink().run();
                setLink(null);
                return;
              }
              if (!safeUrl(link)) {
                setLinkError(
                  "Liên kết cần bắt đầu bằng https:// hoặc http://.",
                );
                return;
              }
              editor
                .chain()
                .extendMarkRange("link")
                .setLink({ href: link })
                .run();
              setLink(null);
            }}
          >
            <div className="field">
              <label>
                Liên kết
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://"
                  autoFocus
                />
              </label>
            </div>
            <p role="status">{linkError}</p>
            <button className="button primary">Lưu liên kết</button>
          </form>
        </BlogDialog>
      )}
    </>
  );
}
