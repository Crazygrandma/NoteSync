import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";

// Plugin: render markdown decorations
const markdownDecorations = ViewPlugin.fromClass(
  class {
    decorations;

    constructor(view) {
      this.decorations = this.buildDecorations(view);
    }

    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view) {
      const builder = [];
      const text = view.state.doc.toString();

      // Bold (**text**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      while ((match = boldRegex.exec(text)) !== null) {
        const from = match.index;
        const to = from + match[0].length;
        const deco = Decoration.mark({
          class: "font-bold text-black",
        });
        builder.push(deco.range(from, to));
      }

      // Heading (# Title)
      const headingRegex = /^# (.*)$/gm;
      while ((match = headingRegex.exec(text)) !== null) {
        const from = match.index;
        const to = from + match[0].length;
        const deco = Decoration.mark({
          class: "text-2xl font-bold",
        });
        builder.push(deco.range(from, to));
      }

      return Decoration.set(builder, true);
    }
  },
  {
    decorations: v => v.decorations,
  }
);

export default function ObsidianStyleEditor() {
  const [value, setValue] = useState("# Hello **Markdown**");

  return (
    <div className="border rounded p-2">
      <CodeMirror
        value={value}
        height="400px"
        extensions={[markdown(), markdownDecorations]}
        onChange={(val) => setValue(val)}
      />
    </div>
  );
}
