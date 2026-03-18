"use client";

import { useState, useEffect, useRef } from "react";
import { Note } from "../page";

interface CommandPaletteProps {
  notes: Note[];
  theme: "dark" | "light";
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onOpenTemplates: () => void;
  onToggleTheme: () => void;
  onToggleFocus: () => void;
  onClose: () => void;
}

type Item =
  | { kind: "note"; note: Note }
  | { kind: "action"; icon: string; label: string; shortcut?: string; action: () => void };

export default function CommandPalette({
  notes, theme, onSelectNote, onCreateNote, onOpenTemplates, onToggleTheme, onToggleFocus, onClose,
}: CommandPaletteProps) {
  const [query, setQuery]       = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

  const isDark   = theme === "dark";
  const bg       = isDark ? "#1e1e1e" : "#ffffff";
  const border   = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const text     = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)";
  const muted    = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const activeBg = isDark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.1)";
  const kbdBg    = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";

  const actions: Item[] = [
    { kind:"action", icon:"✏️",  label:"New blank note",       shortcut:"⌘N",   action: onCreateNote },
    { kind:"action", icon:"📐",  label:"New from template",    shortcut:"⌘⇧T",  action: onOpenTemplates },
    { kind:"action", icon:"🎯",  label:"Toggle focus mode",    shortcut:"⌘⇧F",  action: onToggleFocus },
    { kind:"action", icon: isDark ? "☀️" : "🌙", label: isDark ? "Switch to light mode" : "Switch to dark mode", action: onToggleTheme },
  ];

  const matchedActions: Item[] = query.trim()
    ? actions.filter(a => (a as any).label.toLowerCase().includes(query.toLowerCase()))
    : actions;

  const matchedNotes: Item[] = query.trim()
    ? notes.filter(n => n.title.toLowerCase().includes(query.toLowerCase()) || n.content.replace(/<[^>]+>/g,"").toLowerCase().includes(query.toLowerCase())).slice(0,7).map(note => ({ kind:"note", note }))
    : notes.slice(0,6).map(note => ({ kind:"note", note }));

  const items: Item[] = [...matchedActions, ...matchedNotes];

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setSelected(0); }, [query]);
  useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement;
    el?.scrollIntoView({ block:"nearest" });
  }, [selected]);

  const runItem = (item: Item) => {
    if (item.kind === "note") onSelectNote(item.note.id);
    else item.action();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key==="ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s+1, items.length-1)); }
    if (e.key==="ArrowUp")   { e.preventDefault(); setSelected(s => Math.max(s-1, 0)); }
    if (e.key==="Enter" && items[selected]) runItem(items[selected]);
    if (e.key==="Escape") onClose();
  };

  const notePreview = (n: Note) => {
    const plain = n.content.replace(/<[^>]+>/g,"").trim();
    if (!query.trim()) return plain.slice(0,55) || "No content";
    const idx = plain.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return plain.slice(0,55) || "No content";
    const start = Math.max(0, idx-20);
    return (start>0?"…":"") + plain.slice(start, start+60) + "…";
  };

  return (
    <div className="animate-overlayIn" onClick={onClose}
      style={{ position:"fixed", inset:0, zIndex:9998, background: isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)", backdropFilter:"blur(4px)" }}
    >
      <div className="animate-paletteIn" onClick={e => e.stopPropagation()}
        style={{ position:"absolute", top:"16%", left:"50%", transform:"translateX(-50%)", width:"min(600px,92vw)", background:bg, border:`1px solid ${border}`, borderRadius:"14px", boxShadow: isDark ? "0 32px 80px rgba(0,0,0,0.7)" : "0 32px 80px rgba(0,0,0,0.18)", overflow:"hidden" }}
      >
        {/* Search input */}
        <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 16px", borderBottom:`1px solid ${border}` }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, color:muted }}>
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKey}
            placeholder="Search notes or run a command…"
            style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:"15px", color:text, caretColor:"#6366f1" }}
          />
          {query && <button onClick={() => setQuery("")} style={{ background:"none", border:"none", color:muted, cursor:"pointer", fontSize:"11px" }}>✕</button>}
          <kbd style={{ fontSize:"10px", color:muted, background:kbdBg, padding:"3px 7px", borderRadius:"5px", flexShrink:0 }}>ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto" style={{ maxHeight:"380px", padding:"6px" }}>

          {matchedActions.length > 0 && (
            <p style={{ fontSize:"10px", fontWeight:500, color:muted, textTransform:"uppercase", letterSpacing:"0.08em", padding:"8px 10px 4px" }}>Actions</p>
          )}
          {matchedActions.map((item, i) => {
            const a = item as Extract<Item,{kind:"action"}>;
            const isSel = i === selected;
            return (
              <div key={a.label} onClick={() => runItem(item)} onMouseEnter={() => setSelected(i)}
                style={{ display:"flex", alignItems:"center", gap:"10px", padding:"8px 10px", borderRadius:"8px", cursor:"pointer", background: isSel ? activeBg : "transparent", transition:"background 0.08s" }}
              >
                <span style={{ fontSize:"15px", width:"20px", textAlign:"center" }}>{a.icon}</span>
                <span style={{ flex:1, fontSize:"13px", color:text }}>{a.label}</span>
                {a.shortcut && <kbd style={{ fontSize:"10px", color:muted, background:kbdBg, padding:"2px 6px", borderRadius:"4px" }}>{a.shortcut}</kbd>}
              </div>
            );
          })}

          {matchedNotes.length > 0 && (
            <p style={{ fontSize:"10px", fontWeight:500, color:muted, textTransform:"uppercase", letterSpacing:"0.08em", padding:"8px 10px 4px", marginTop:"4px" }}>
              {query ? "Notes" : "Recent notes"}
            </p>
          )}
          {matchedNotes.map((item, idx) => {
            const gIdx = matchedActions.length + idx;
            const n = (item as Extract<Item,{kind:"note"}>).note;
            const isSel = gIdx === selected;
            return (
              <div key={n.id} onClick={() => runItem(item)} onMouseEnter={() => setSelected(gIdx)}
                style={{ display:"flex", alignItems:"flex-start", gap:"10px", padding:"8px 10px", borderRadius:"8px", cursor:"pointer", background: isSel ? activeBg : "transparent", transition:"background 0.08s" }}
              >
                {/* Note emoji */}
                <span style={{ fontSize:"16px", flexShrink:0, marginTop:"1px" }}>{n.emoji || "📄"}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                    {n.isPinned && <span style={{ fontSize:"10px", opacity:0.6 }}>📌</span>}
                    {n.isFavorite && <span style={{ fontSize:"10px" }}>⭐</span>}
                    <p style={{ fontSize:"13px", fontWeight:500, color:text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", margin:0 }}>{n.title||"Untitled"}</p>
                  </div>
                  <p style={{ fontSize:"11px", color:muted, marginTop:"2px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{notePreview(n)}</p>
                </div>
                {n.color && <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:n.color, flexShrink:0, marginTop:"6px" }} />}
              </div>
            );
          })}

          {items.length === 0 && (
            <div style={{ padding:"32px 16px", textAlign:"center", color:muted, fontSize:"13px" }}>No results for "{query}"</div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display:"flex", gap:"16px", padding:"8px 16px", borderTop:`1px solid ${border}` }}>
          {[["↑↓","Navigate"],["↵","Open"],["⌘K","Close"]].map(([k,l]) => (
            <span key={k} style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"10px", color:muted }}>
              <kbd style={{ background:kbdBg, padding:"2px 5px", borderRadius:"4px" }}>{k}</kbd>{l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}