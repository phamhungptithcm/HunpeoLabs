"use client";
import CodeBlock from "@tiptap/extension-code-block";
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { isMermaidBlock } from "@/lib/blog/mermaid-source";
function CodeBlockView({ node }: ReactNodeViewProps) {
  const diagram = isMermaidBlock(node.attrs.language, node.textContent);
  return <NodeViewWrapper className={diagram ? "editor-diagram-block" : "editor-code-block"}>
    {diagram ? <>
      <div contentEditable={false}><MermaidDiagram source={node.textContent} /></div>
      <details className="editor-diagram-source"><summary contentEditable={false}>Chỉnh mã Mermaid</summary><NodeViewContent className="editor-code-content" /></details>
    </> : <NodeViewContent className="editor-code-content" />}
  </NodeViewWrapper>;
}
export const DiagramCodeBlock = CodeBlock.extend({
  addNodeView() { return ReactNodeViewRenderer(CodeBlockView); },
});
