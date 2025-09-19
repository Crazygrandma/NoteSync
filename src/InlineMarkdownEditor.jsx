import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { Decoration, ViewPlugin, EditorView, WidgetType} from "@codemirror/view";
import {atomone} from "@uiw/codemirror-theme-atomone"


/** Widget replaces matched markdown markers with styled HTML */
class MarkdownWidget extends WidgetType {
  constructor(content, className) {
    super();
    this.content = content;
    this.className = className;
  }
  toDOM() {
    const span = document.createElement("span");
    span.className = this.className;
    span.textContent = this.content;
    return span;
  }
  ignoreEvent() {
    return true; // allow caret/mouse events inside
  }
}

const renderMarkdownPlugin = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = this.buildDecorations(view);
    }
    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }
    buildDecorations(view) {
      const decos = [];
      const { from, to } = view.viewport;
      const text = view.state.doc.sliceString(from, to);

      let m;

      // Headings
      const headingRE = /^(#{1,6})\s+(.*)$/gm;
      while ((m = headingRE.exec(text)) !== null) {
        const start = from + m.index;
        const end = start + m[0].length;
        const level = m[1].length;
        const widget = Decoration.replace({
          widget: new MarkdownWidget(m[2], `cm-heading cm-heading-${level}`),
        });
        decos.push(widget.range(start, end));
      }

      // Bold **text**
      const boldRE = /\*\*(.+?)\*\*/g;
      while ((m = boldRE.exec(text)) !== null) {
        const start = from + m.index;
        const end = start + m[0].length;
        const widget = Decoration.replace({
          widget: new MarkdownWidget(m[1], "cm-strong"),
        });
        decos.push(widget.range(start, end));
      }

      // Italic *text* or _text_
      const italicRE = /(?:\*|_)([^*_]+?)(?:\*|_)/g;
      while ((m = italicRE.exec(text)) !== null) {
        const start = from + m.index;
        const end = start + m[0].length;
        const widget = Decoration.replace({
          widget: new MarkdownWidget(m[1], "cm-em"),
        });
        decos.push(widget.range(start, end));
      }

      // Inline code `code`
      const codeRE = /`([^`]+?)`/g;
      while ((m = codeRE.exec(text)) !== null) {
        const start = from + m.index;
        const end = start + m[0].length;
        const widget = Decoration.replace({
          widget: new MarkdownWidget(m[1], "cm-inline-code"),
        });
        decos.push(widget.range(start, end));
      }

      // Strikethrough ~~text~~
      const strikeRE = /~~(.+?)~~/g;
      while ((m = strikeRE.exec(text)) !== null) {
        const start = from + m.index;
        const end = start + m[0].length;
        const widget = Decoration.replace({
          widget: new MarkdownWidget(m[1], "cm-strike"),
        });
        decos.push(widget.range(start, end));
      }

      // Links [text](url) → render text, keep URL in title
      const linkRE = /\[([^\]]+)\]\(([^)]+)\)/g;
      while ((m = linkRE.exec(text)) !== null) {
        const start = from + m.index;
        const end = start + m[0].length;
        const a = document.createElement("a");
        a.className = "cm-link";
        a.href = m[2];
        a.textContent = m[1];
        const widget = Decoration.replace({
          widget: new (class extends WidgetType {
            toDOM() {
              return a;
            }
          })(),
        });
        decos.push(widget.range(start, end));
      }

      return Decoration.set(decos, true);
    }
  },
  { decorations: (v) => v.decorations }
);

export default function InlineMarkdownEditor() {
  const [value, setValue] = React.useState(`# Heading 1

This is **bold**, *italic*, \`inline code\`, ~~strike~~, and a [link](https://example.com).
`);

  const onChange = React.useCallback((val) => {
    setValue(val);
  }, []);

  return (
    <CodeMirror
      value={value}
      height="100vh"
      theme={atomone}
      extensions={[
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        renderMarkdownPlugin
      ]}
      onChange={onChange}
    />
  );
}