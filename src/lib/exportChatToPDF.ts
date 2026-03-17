import type {Message} from "@/types/chat.ts";

export const exportChatToPDF = (title: string, messages: Message[]) => {
  if (!messages.length) return

  const bubblesHtml = messages.map((m) => {
    const isUser = m.sender_type === "user"
    // marked.parse() se zavolá v okně přes inline script
    const escapedContent = m.content
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")
    const escapedThink = (m.think || "")
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")

    return `
      <div class="row ${isUser ? "row-user" : "row-ai"}">
        <div class="bubble ${isUser ? "bubble-user" : "bubble-ai"}">
          ${m.think ? `<div class="think">💭 <span data-md="${encodeURIComponent(escapedThink)}"></span></div>` : ""}
          <div class="content" data-md="${encodeURIComponent(escapedContent)}"></div>
          <div class="time">${m.created_at}</div>
        </div>
      </div>`
  }).join("")

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"/>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #fff; margin: 0; padding: 32px; color: #111; max-width: 860px; margin: 0 auto; }
    h1 { font-size: 1.1rem; font-weight: 600; margin-bottom: 28px; color: #666; border-bottom: 1px solid #eee; padding-bottom: 12px; }
    .row { display: flex; margin-bottom: 14px; }
    .row-user { justify-content: flex-end; }
    .row-ai   { justify-content: flex-start; }
    .bubble { max-width: 72%; padding: 10px 16px; border-radius: 18px; font-size: 0.88rem; line-height: 1.6; }
    .bubble-user { background: #2563eb; color: #fff; border-bottom-right-radius: 4px; }
    .bubble-ai   { background: #f1f5f9; color: #111; border-bottom-left-radius: 4px; }
    .bubble-user p, .bubble-user li { color: #fff; }
    .think { font-size: 0.78rem; color: #94a3b8; font-style: italic; margin-bottom: 8px; border-left: 2px solid #cbd5e1; padding-left: 8px; }
    .time  { font-size: 0.68rem; opacity: 0.45; margin-top: 8px; text-align: right; }
    /* Markdown styles */
    .content p { margin: 0 0 8px; }
    .content p:last-child { margin-bottom: 0; }
    .content ul, .content ol { margin: 4px 0 8px 20px; padding: 0; }
    .content li { margin-bottom: 2px; }
    .content code { background: rgba(0,0,0,0.08); padding: 1px 5px; border-radius: 4px; font-size: 0.85em; font-family: monospace; }
    .bubble-user .content code { background: rgba(255,255,255,0.2); }
    .content pre { background: #1e293b; color: #e2e8f0; border-radius: 8px; padding: 12px; overflow-x: auto; margin: 8px 0; }
    .content pre code { background: none; color: inherit; padding: 0; font-size: 0.82em; }
    .content blockquote { border-left: 3px solid #cbd5e1; margin: 6px 0; padding-left: 10px; color: #64748b; }
    .content h1,.content h2,.content h3 { margin: 10px 0 4px; font-size: 1em; }
    .content table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 0.82em; }
    .content th, .content td { border: 1px solid #e2e8f0; padding: 5px 10px; text-align: left; }
    .content th { background: #f8fafc; }
    @media print {
      body { padding: 16px; }
      .bubble { max-width: 78%; }
    }
  </style>
</head>
<body>
  <h1>💬 ${title}</h1>
  ${bubblesHtml}
  <script>
    marked.setOptions({ breaks: true });
    document.querySelectorAll('[data-md]').forEach(el => {
      el.innerHTML = marked.parse(decodeURIComponent(el.getAttribute('data-md')));
    });
    document.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
    window.onload = () => setTimeout(() => window.print(), 300);
  </script>
</body>
</html>`

  const win = window.open("", "_blank")
  if (!win) return
  win.document.write(html)
  win.document.close()
}