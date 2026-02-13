import React, { useState, useMemo } from 'react';
import { Copy, FileText, Code } from 'lucide-react';
import { Button } from './Button';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
  })
);

marked.setOptions({ gfm: true, breaks: true });

const DEFAULT_MARKDOWN = `# Markdown Preview

Welcome to the **Markdown Live Preview** tool. Start typing on the left to see the rendered output here.

## Features

- **Bold**, *italic*, and ~~strikethrough~~ text
- [Links](https://example.com) and images
- Code blocks with syntax highlighting
- Tables, task lists, and blockquotes

## Code Example

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

Inline code works too: \`const x = 42;\`

## Table

| Feature       | Status |
|---------------|--------|
| GFM Tables    | Done   |
| Task Lists    | Done   |
| Syntax Highlighting | Done |

## Task List

- [x] Set up markdown parser
- [x] Add syntax highlighting
- [ ] Write documentation
- [ ] Ship it

## Blockquote

> "The best way to predict the future is to invent it."
> — Alan Kay

---

*Edit the markdown on the left to see changes in real-time.*
`;

export const MarkdownTool: React.FC = () => {
  const [input, setInput] = useState(DEFAULT_MARKDOWN);

  const html = useMemo(() => {
    try {
      return marked.parse(input) as string;
    } catch {
      return '<p class="text-red-400">Error parsing markdown</p>';
    }
  }, [input]);

  const copyMarkdown = () => navigator.clipboard.writeText(input);
  const copyHtml = () => navigator.clipboard.writeText(html);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Markdown Preview</h2>
          <p className="text-slate-400 text-sm">
            Live editor with GFM support and syntax highlighting.
            <span className="ml-2 text-slate-500">{input.length} chars</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={copyMarkdown}>
            <Copy size={14} className="mr-2" /> Markdown
          </Button>
          <Button variant="secondary" size="sm" onClick={copyHtml}>
            <Code size={14} className="mr-2" /> HTML
          </Button>
        </div>
      </div>

      {/* Split Pane */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-0 px-6 pb-6">
        {/* Editor */}
        <div className="flex flex-col min-h-0 lg:border-r border-dark-700">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={14} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Editor</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 w-full bg-dark-900 border border-dark-700 lg:border-r-0 rounded-lg lg:rounded-r-none p-4 font-mono text-sm text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            placeholder="Type your markdown here..."
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-2 lg:pl-4">
            <Code size={14} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preview</span>
          </div>
          <div
            className="markdown-preview flex-1 overflow-y-auto bg-dark-900 border border-dark-700 lg:border-l-0 rounded-lg lg:rounded-l-none p-6"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      {/* Scoped prose styles for rendered markdown */}
      <style>{`
        .markdown-preview {
          color: #e2e8f0;
          line-height: 1.75;
        }
        .markdown-preview h1 {
          font-size: 2em;
          font-weight: 700;
          color: #f8fafc;
          margin: 0 0 0.5em 0;
          padding-bottom: 0.3em;
          border-bottom: 1px solid #334155;
        }
        .markdown-preview h2 {
          font-size: 1.5em;
          font-weight: 600;
          color: #f8fafc;
          margin: 1.2em 0 0.5em 0;
          padding-bottom: 0.25em;
          border-bottom: 1px solid #334155;
        }
        .markdown-preview h3 {
          font-size: 1.25em;
          font-weight: 600;
          color: #f1f5f9;
          margin: 1em 0 0.4em 0;
        }
        .markdown-preview h4, .markdown-preview h5, .markdown-preview h6 {
          font-weight: 600;
          color: #f1f5f9;
          margin: 1em 0 0.4em 0;
        }
        .markdown-preview p {
          margin: 0 0 1em 0;
        }
        .markdown-preview a {
          color: #818cf8;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .markdown-preview a:hover {
          color: #a5b4fc;
        }
        .markdown-preview strong {
          color: #f8fafc;
          font-weight: 600;
        }
        .markdown-preview del {
          color: #94a3b8;
        }
        .markdown-preview ul, .markdown-preview ol {
          margin: 0 0 1em 0;
          padding-left: 1.5em;
        }
        .markdown-preview ul {
          list-style-type: disc;
        }
        .markdown-preview ol {
          list-style-type: decimal;
        }
        .markdown-preview li {
          margin: 0.25em 0;
        }
        .markdown-preview li > ul, .markdown-preview li > ol {
          margin: 0.25em 0;
        }
        .markdown-preview blockquote {
          border-left: 3px solid #6366f1;
          padding: 0.5em 1em;
          margin: 1em 0;
          background: rgba(99, 102, 241, 0.05);
          color: #cbd5e1;
        }
        .markdown-preview blockquote p {
          margin: 0.25em 0;
        }
        .markdown-preview code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875em;
          background: #1e293b;
          color: #e2e8f0;
          padding: 0.15em 0.4em;
          border-radius: 4px;
        }
        .markdown-preview pre {
          margin: 1em 0;
          border-radius: 8px;
          overflow-x: auto;
        }
        .markdown-preview pre code {
          display: block;
          padding: 1em;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 8px;
          font-size: 0.85em;
          line-height: 1.6;
        }
        .markdown-preview table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
        }
        .markdown-preview th {
          background: #1e293b;
          color: #f1f5f9;
          font-weight: 600;
          text-align: left;
          padding: 0.6em 1em;
          border: 1px solid #334155;
        }
        .markdown-preview td {
          padding: 0.6em 1em;
          border: 1px solid #334155;
        }
        .markdown-preview tr:nth-child(even) {
          background: rgba(30, 41, 59, 0.5);
        }
        .markdown-preview hr {
          border: none;
          border-top: 1px solid #334155;
          margin: 1.5em 0;
        }
        .markdown-preview img {
          max-width: 100%;
          border-radius: 8px;
        }
        .markdown-preview input[type="checkbox"] {
          margin-right: 0.5em;
          accent-color: #6366f1;
        }
        .markdown-preview li:has(> input[type="checkbox"]) {
          list-style: none;
          margin-left: -1.5em;
        }
      `}</style>
    </div>
  );
};
