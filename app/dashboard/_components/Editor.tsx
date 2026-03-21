"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Note } from "../page";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

interface EditorProps {
  note: Note | null;
  theme: "dark" | "light";
  focusMode: boolean;
  onUpdateNote: (id: string, title: string, content: string) => void;
  onToggleFocus: () => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
  onSetEmoji: (id: string, emoji: string) => void;
  onSetColor: (id: string, color: string) => void;
  allTags: string[];
}

type SaveState = "saved" | "saving";

const NOTE_EMOJIS = ["📄","🧠","💡","🔥","⭐","📌","🎯","📚","✅","🚀","💜","🌿","🎨","🔮","⚡","🌊","🏔️","🎵","💎","🗺️"];

const NOTE_COLORS = [
  { label:"None",    value:"",        display:"transparent" },
  { label:"Indigo",  value:"#6366f1", display:"#6366f1" },
  { label:"Blue",    value:"#3b82f6", display:"#3b82f6" },
  { label:"Teal",    value:"#14b8a6", display:"#14b8a6" },
  { label:"Green",   value:"#22c55e", display:"#22c55e" },
  { label:"Amber",   value:"#f59e0b", display:"#f59e0b" },
  { label:"Red",     value:"#ef4444", display:"#ef4444" },
  { label:"Pink",    value:"#ec4899", display:"#ec4899" },
  { label:"Purple",  value:"#a855f7", display:"#a855f7" },
];

const TAG_COLORS = [
  { bg:"rgba(99,102,241,0.18)", text:"#818cf8" },
  { bg:"rgba(16,185,129,0.18)", text:"#34d399" },
  { bg:"rgba(245,158,11,0.18)", text:"#fbbf24" },
  { bg:"rgba(239,68,68,0.18)",  text:"#f87171" },
  { bg:"rgba(236,72,153,0.18)", text:"#f472b6" },
  { bg:"rgba(14,165,233,0.18)", text:"#38bdf8" },
];

function tagColor(tag: string) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = tag.charCodeAt(i) + ((h<<5)-h);
  return TAG_COLORS[Math.abs(h) % TAG_COLORS.length];
}

export default function Editor({
  note, theme, focusMode,
  onUpdateNote, onToggleFocus,
  onAddTag, onRemoveTag, onSetEmoji, onSetColor, allTags,
}: EditorProps) {
  const [title, setTitle]             = useState("");
  const [saveState, setSaveState]     = useState<SaveState>("saved");
  const [tagInput, setTagInput]       = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [showEmoji, setShowEmoji]     = useState(false);
  const [showColor, setShowColor]     = useState(false);
  const [showExport, setShowExport]   = useState(false);
  const titleRef   = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const isDark  = theme === "dark";
  const bg      = isDark ? "#282828" : "#f5f5f0";
  const textC   = isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.82)";
  const mutedC  = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.35)";
  const borderC = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
  const tbBg    = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const tbActive= isDark ? "rgba(255,255,255,0.13)" : "rgba(0,0,0,0.11)";
  const popupBg = isDark ? "#1e1e1e" : "#ffffff";
  const popupBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";

  // Close popups on outside click
  useEffect(() => {
    const h = () => { setShowEmoji(false); setShowColor(false); setShowExport(false); };
    if (showEmoji || showColor || showExport) {
      window.addEventListener("mousedown", h);
      return () => window.removeEventListener("mousedown", h);
    }
  }, [showEmoji, showColor, showExport]);

  // ── Tiptap ────────────────────────────────────────────
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1,2,3] } }),
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: "",
    editorProps: {
      attributes: { class:"ProseMirror", style:`font-size:15px;line-height:1.85;color:${textC};min-height:52vh;outline:none;` },
    },
    onUpdate: ({ editor }) => {
      setSaveState("saving");
      if (note) debouncedSaveRef.current(title, editor.getHTML(), note.id, onUpdateNote);
    },
  });

  useEffect(() => {
    if (note && editor) {
      setTitle(note.title ?? "");
      const isHTML = note.content.trim().startsWith("<");
      editor.commands.setContent(isHTML ? note.content : note.content || "");
      setSaveState("saved");
    }
  }, [note?.id]);

  useEffect(() => {
    editor?.view.dom.setAttribute("style", `font-size:15px;line-height:1.85;color:${textC};min-height:52vh;outline:none;`);
  }, [theme]);

  const debouncedSaveRef = useRef(
    debounce((t: string, html: string, id: string, cb: (id: string, t: string, h: string) => void) => {
      cb(id, t, html);
      setSaveState("saved");
    }, 600)
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSaveState("saving");
    if (note && editor) debouncedSaveRef.current(e.target.value, editor.getHTML(), note.id, onUpdateNote);
  };

  const handleAddTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && note && !note.tags.includes(t)) onAddTag(note.id, t);
    setTagInput(""); setShowTagInput(false);
  };

  // ── Export ────────────────────────────────────────────
  const exportMarkdown = () => {
    if (!note) return;
    const plain = note.content.replace(/<h1>/g,"# ").replace(/<\/h1>/g,"\n").replace(/<h2>/g,"## ").replace(/<\/h2>/g,"\n").replace(/<h3>/g,"### ").replace(/<\/h3>/g,"\n").replace(/<strong>/g,"**").replace(/<\/strong>/g,"**").replace(/<em>/g,"_").replace(/<\/em>/g,"_").replace(/<li>/g,"- ").replace(/<\/li>/g,"\n").replace(/<[^>]+>/g,"").trim();
    const md = `# ${note.title}\n\n${plain}`;
    const blob = new Blob([md], { type:"text/markdown" });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${note.title || "note"}.md`;
    a.click(); URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const exportHTML = () => {
    if (!note) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${note.title}</title><style>body{font-family:-apple-system,sans-serif;max-width:720px;margin:60px auto;padding:0 24px;color:#1a1a1a;line-height:1.8}h1{font-size:2em;font-weight:700;margin-bottom:8px}h2{font-size:1.4em;font-weight:600}code{background:#f0f0f0;padding:2px 6px;border-radius:4px;font-family:monospace}pre{background:#f5f5f5;padding:16px;border-radius:8px;overflow-x:auto}blockquote{border-left:3px solid #ccc;padding-left:16px;color:#666}</style></head><body><h1>${note.title}</h1>${note.content}</body></html>`;
    const blob = new Blob([html], { type:"text/html" });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${note.title || "note"}.html`;
    a.click(); URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const exportPDF = () => {
    if (!note) return;
    const win = window.open("","_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${note.title}</title><style>body{font-family:-apple-system,sans-serif;max-width:720px;margin:60px auto;padding:0 24px;color:#1a1a1a;line-height:1.8}h1{font-size:2em;font-weight:700}h2{font-size:1.4em;font-weight:600}code{background:#f0f0f0;padding:2px 6px;border-radius:4px;font-family:monospace}blockquote{border-left:3px solid #ccc;padding-left:16px;color:#666}@media print{body{margin:0}}</style></head><body><h1>${note.title}</h1>${note.content}</body></html>`);
    win.document.close();
    win.print();
    setShowExport(false);
  };

  const words    = editor?.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0;
  const readTime = words < 200 ? "< 1 min" : `${Math.ceil(words/200)} min`;

  // Empty state
  if (!note) {
    return (
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", backgroundColor:bg, textAlign:"center", padding:"32px", transition:"background 0.2s" }}>
        <div style={{ fontSize:"52px", opacity:0.08, marginBottom:"16px" }}>🧠</div>
        <p style={{ fontSize:"14px", color:mutedC, lineHeight:1.6, maxWidth:"220px" }}>Select a note or create one</p>
        <div style={{ display:"flex", gap:"8px", marginTop:"16px", flexWrap:"wrap", justifyContent:"center" }}>
          {[["⌘N","New note"],["⌘K","Command palette"],["⌘⇧T","Templates"],["⌘⇧F","Focus mode"]].map(([k,l]) => (
            <div key={k} style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"11px", color:mutedC }}>
              <kbd style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", padding:"2px 6px", borderRadius:"4px", fontSize:"10px" }}>{k}</kbd>
              <span>{l}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const lastEdited = new Date(note.updatedAt).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", height:"100%", backgroundColor:bg, overflow:"hidden", minWidth:0, transition:"background 0.2s" }}>

      {/* ── Toolbar ───────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"5px 16px", borderBottom:`1px solid ${borderC}`, flexShrink:0, gap:"6px" }}>

        {/* Left breadcrumb */}
        <div style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"11px", color:mutedC, minWidth:0 }}>
          <span style={{ opacity:0.6 }}>✦</span>
          <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"160px" }}>{title||"Untitled"}</span>
        </div>

        {/* Center: formatting */}
        {editor && (
          <div style={{ display:"flex", alignItems:"center", gap:"1px", flexShrink:0 }}>
            {[
              { label:"B",  title:"Bold",        style:{fontWeight:700},         active:editor.isActive("bold"),          cmd:()=>editor.chain().focus().toggleBold().run() },
              { label:"I",  title:"Italic",       style:{fontStyle:"italic"},     active:editor.isActive("italic"),        cmd:()=>editor.chain().focus().toggleItalic().run() },
              { label:"H1", title:"Heading 1",    style:{fontSize:"10px",fontWeight:700}, active:editor.isActive("heading",{level:1}), cmd:()=>editor.chain().focus().toggleHeading({level:1}).run() },
              { label:"H2", title:"Heading 2",    style:{fontSize:"10px",fontWeight:700}, active:editor.isActive("heading",{level:2}), cmd:()=>editor.chain().focus().toggleHeading({level:2}).run() },
              { label:"≡",  title:"Bullet list",  style:{fontSize:"14px"},        active:editor.isActive("bulletList"),    cmd:()=>editor.chain().focus().toggleBulletList().run() },
              { label:"№",  title:"Ordered list", style:{fontSize:"11px"},        active:editor.isActive("orderedList"),   cmd:()=>editor.chain().focus().toggleOrderedList().run() },
              { label:"<>", title:"Code",         style:{fontFamily:"monospace",fontSize:"10px"}, active:editor.isActive("codeBlock"), cmd:()=>editor.chain().focus().toggleCodeBlock().run() },
              { label:"❝",  title:"Blockquote",   style:{fontSize:"13px"},        active:editor.isActive("blockquote"),   cmd:()=>editor.chain().focus().toggleBlockquote().run() },
            ].map(btn => (
              <button key={btn.label} onClick={btn.cmd} title={btn.title}
                style={{ width:"25px", height:"23px", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"4px", border:"none", cursor:"pointer", fontSize:"12px", background: btn.active ? tbActive : "transparent", color: btn.active ? (isDark?"rgba(255,255,255,0.9)":"rgba(0,0,0,0.85)") : mutedC, transition:"all 0.1s", ...btn.style }}
                onMouseEnter={e => { if (!btn.active) (e.currentTarget as HTMLButtonElement).style.background = tbBg; }}
                onMouseLeave={e => { if (!btn.active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >{btn.label}</button>
            ))}
          </div>
        )}

        {/* Right: stats + actions */}
        <div style={{ display:"flex", alignItems:"center", gap:"6px", flexShrink:0 }}>
          {words > 0 && <span style={{ fontSize:"10px", color:mutedC }}>{words}w · {readTime}</span>}

          {/* Export button */}
          <div style={{ position:"relative" }}>
            <button onClick={e => { e.stopPropagation(); setShowExport(s=>!s); setShowEmoji(false); setShowColor(false); }}
              title="Export note"
              style={{ padding:"3px 8px", borderRadius:"5px", border:`1px solid ${borderC}`, background:"transparent", color:mutedC, fontSize:"10px", cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = textC; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = mutedC; }}
            >📤 Export</button>
            {showExport && (
              <div onMouseDown={e => e.stopPropagation()}
                style={{ position:"absolute", top:"calc(100% + 6px)", right:0, width:"160px", background:popupBg, border:`1px solid ${popupBorder}`, borderRadius:"8px", boxShadow:"0 12px 40px rgba(0,0,0,0.4)", padding:"4px 0", zIndex:500 }}
                className="animate-contextMenuIn"
              >
                {[
                  { icon:"📝", label:"Export as Markdown", fn: exportMarkdown },
                  { icon:"🌐", label:"Export as HTML",     fn: exportHTML },
                  { icon:"🖨️", label:"Print / Save PDF",   fn: exportPDF },
                ].map(opt => (
                  <button key={opt.label} onClick={opt.fn}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:"8px", padding:"7px 12px", background:"transparent", border:"none", color: isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.72)", fontSize:"12px", cursor:"pointer", textAlign:"left" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  ><span>{opt.icon}</span><span>{opt.label}</span></button>
                ))}
              </div>
            )}
          </div>

          {/* Save + focus */}
          <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
            <div className={saveState==="saving" ? "animate-pulse-dot" : ""}
              style={{ width:"6px", height:"6px", borderRadius:"50%", background: saveState==="saved" ? "rgba(52,211,153,0.75)" : "rgba(251,191,36,0.75)" }} />
            <span style={{ fontSize:"10px", color:mutedC }}>{saveState==="saved" ? "Saved" : "Saving…"}</span>
          </div>
          <button onClick={onToggleFocus} title={focusMode ? "Exit focus (Esc)" : "Focus mode (⌘⇧F)"}
            style={{ padding:"3px 8px", borderRadius:"5px", border:`1px solid ${borderC}`, background: focusMode ? "rgba(99,102,241,0.2)" : "transparent", color: focusMode ? "#818cf8" : mutedC, fontSize:"10px", cursor:"pointer" }}>
            {focusMode ? "✕ Exit" : "⌘⇧F"}
          </button>
        </div>
      </div>

      {/* ── Writing area ──────────────────────────── */}
      <div className="overflow-y-auto" style={{ flex:1 }}>
        <div style={{ maxWidth: focusMode ? "680px" : "700px", margin:"0 auto", padding: focusMode ? "56px 48px 120px" : "32px 48px 96px", transition:"all 0.3s" }}>

          {/* Color bar — if note has a color */}
          {note.color && (
            <div style={{ height:"3px", borderRadius:"99px", background:note.color, marginBottom:"20px", opacity:0.75 }} />
          )}

          {/* Emoji + Title row */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:"10px", marginBottom:"8px" }}>
            {/* Emoji picker */}
            <div style={{ position:"relative", flexShrink:0 }}>
              <button onClick={e => { e.stopPropagation(); setShowEmoji(s=>!s); setShowColor(false); setShowExport(false); }}
                title="Change icon"
                style={{ fontSize: focusMode ? "38px" : "32px", lineHeight:1, background:"transparent", border:"none", cursor:"pointer", padding:"2px", borderRadius:"6px", transition:"all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >{note.emoji || "📄"}</button>
              {showEmoji && (
                <div onMouseDown={e => e.stopPropagation()}
                  className="animate-contextMenuIn"
                  style={{ position:"absolute", top:"calc(100% + 6px)", left:0, background:popupBg, border:`1px solid ${popupBorder}`, borderRadius:"10px", boxShadow:"0 12px 40px rgba(0,0,0,0.4)", padding:"10px", zIndex:500, display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"4px", width:"160px" }}
                >
                  {NOTE_EMOJIS.map(em => (
                    <button key={em} onClick={() => { onSetEmoji(note.id, em); setShowEmoji(false); }}
                      style={{ fontSize:"20px", padding:"5px", borderRadius:"6px", border:"none", background:"transparent", cursor:"pointer", textAlign:"center", transition:"background 0.1s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >{em}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <input ref={titleRef} type="text" value={title} onChange={handleTitleChange}
              placeholder="Untitled"
              style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize: focusMode ? "34px" : "30px", fontWeight:700, color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.88)", lineHeight:1.2, letterSpacing:"-0.02em", paddingTop:"4px", transition:"font-size 0.3s" }}
            />

            {/* Color picker */}
            <div style={{ position:"relative", flexShrink:0, marginTop:"6px" }}>
              <button onClick={e => { e.stopPropagation(); setShowColor(s=>!s); setShowEmoji(false); setShowExport(false); }}
                title="Note color"
                style={{ width:"18px", height:"18px", borderRadius:"50%", background: note.color || (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"), border: note.color ? `2px solid ${note.color}55` : `2px solid ${borderC}`, cursor:"pointer", transition:"all 0.15s" }}
              />
              {showColor && (
                <div onMouseDown={e => e.stopPropagation()}
                  className="animate-contextMenuIn"
                  style={{ position:"absolute", top:"calc(100% + 6px)", right:0, background:popupBg, border:`1px solid ${popupBorder}`, borderRadius:"10px", boxShadow:"0 12px 40px rgba(0,0,0,0.4)", padding:"10px", zIndex:500, display:"flex", gap:"6px", flexWrap:"wrap", width:"164px" }}
                >
                  {NOTE_COLORS.map(c => (
                    <button key={c.value} onClick={() => { onSetColor(note.id, c.value); setShowColor(false); }}
                      title={c.label}
                      style={{ width:"24px", height:"24px", borderRadius:"50%", background: c.value || (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"), border: note.color===c.value ? `2px solid white` : "2px solid transparent", cursor:"pointer", transition:"all 0.1s", outline: c.value==="" ? `1px dashed ${mutedC}` : "none" }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:"5px", marginBottom:"8px" }}>
            {note.tags.map(tag => {
              const c = tagColor(tag);
              return (
                <span key={tag} className="tag-pill" style={{ background:c.bg, color:c.text }}
                  onClick={() => onRemoveTag(note.id, tag)} title="Click to remove">
                  {tag} <span style={{ opacity:0.55, fontSize:"9px" }}>✕</span>
                </span>
              );
            })}
            {showTagInput ? (
              <input ref={tagInputRef} autoFocus value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if(e.key==="Enter") handleAddTag(tagInput); if(e.key==="Escape"){setShowTagInput(false);setTagInput("");} }}
                onBlur={() => { if(tagInput) handleAddTag(tagInput); else setShowTagInput(false); }}
                placeholder="tag name…"
                style={{ fontSize:"11px", padding:"2px 8px", borderRadius:"99px", border:`1px solid ${borderC}`, background:"transparent", color:textC, outline:"none", width:"90px" }}
              />
            ) : (
              <button onClick={() => setShowTagInput(true)}
                style={{ fontSize:"11px", padding:"2px 8px", borderRadius:"99px", border:`1px dashed ${borderC}`, background:"transparent", color:mutedC, cursor:"pointer" }}>
                + tag
              </button>
            )}
          </div>

          {/* Date */}
          <p style={{ fontSize:"11px", color:mutedC, marginBottom:"18px", paddingBottom:"14px", borderBottom:`1px solid ${borderC}` }}>
            Created {new Date(note.createdAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
            {note.isPinned && <span style={{ marginLeft:"10px", fontSize:"10px", opacity:0.6 }}>📌 Pinned</span>}
          </p>

          {/* Tiptap */}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}