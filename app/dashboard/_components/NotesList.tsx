"use client";

import { useState, useRef, useEffect, useCallback, forwardRef } from "react";
import { Note, SidebarView } from "../page";

interface NotesListProps {
  notes: Note[];
  activeNoteId: string | null;
  sidebarView: SidebarView;
  theme: "dark" | "light";
  onSelectNote: (id: string) => void;
  onTrashNote: (id: string) => void;
  onRestoreNote: (id: string) => void;
  onDeletePermanently: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDuplicateNote: (id: string) => void;
  onCreateNote: () => void;
}

interface CtxMenu { x: number; y: number; noteId: string; }

export default function NotesList({
  notes, activeNoteId, sidebarView, theme,
  onSelectNote, onTrashNote, onRestoreNote,
  onDeletePermanently, onToggleFavorite, onTogglePin,
  onDuplicateNote, onCreateNote,
}: NotesListProps) {
  const [query, setQuery]       = useState("");
  const [ctxMenu, setCtxMenu]   = useState<CtxMenu | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef   = useRef<HTMLDivElement>(null);

  const isDark  = theme === "dark";
  const bg      = isDark ? "#252525" : "#eeeeea";
  const borderC = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const text    = isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.78)";
  const muted   = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.35)";

  const filtered = query.trim() === "" ? notes
    : notes.filter(n =>
        n.title.toLowerCase().includes(query.toLowerCase()) ||
        n.content.replace(/<[^>]+>/g,"").toLowerCase().includes(query.toLowerCase())
      );

  const handleCtx = useCallback((e: React.MouseEvent, noteId: string) => {
    e.preventDefault(); e.stopPropagation();
    setCtxMenu({ x: Math.min(e.clientX, window.innerWidth-215), y: Math.min(e.clientY, window.innerHeight-230), noteId });
  }, []);

  const closeCtx = useCallback(() => setCtxMenu(null), []);

  useEffect(() => {
    if (!ctxMenu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key==="Escape") closeCtx(); };
    const onClk = (e: MouseEvent)    => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeCtx(); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClk);
    window.addEventListener("scroll", closeCtx, true);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("mousedown", onClk); window.removeEventListener("scroll", closeCtx, true); };
  }, [ctxMenu, closeCtx]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey||e.ctrlKey) && e.key==="f") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key==="Escape") { setQuery(""); searchRef.current?.blur(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const panelLabel = sidebarView==="favorites" ? "Favorites" : sidebarView==="trash" ? "Trash" : "All Notes";
  const pinnedCount = filtered.filter(n => n.isPinned).length;

  return (
    <div style={{ width:"260px", minWidth:"260px", height:"100%", backgroundColor:bg, borderRight:`1px solid ${borderC}`, display:"flex", flexDirection:"column", flexShrink:0, position:"relative", transition:"background 0.2s" }}>

      {/* Header */}
      <div style={{ padding:"13px 13px 10px", borderBottom:`1px solid ${borderC}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: sidebarView!=="trash" ? "10px" : "4px" }}>
          <h2 style={{ fontSize:"13px", fontWeight:600, color:text, margin:0 }}>
            {panelLabel}
            {notes.length > 0 && <span style={{ marginLeft:"6px", fontWeight:400, fontSize:"12px", color:muted }}>{notes.length}</span>}
          </h2>
          {sidebarView==="all" && (
            <button onClick={onCreateNote}
              style={{ width:"22px", height:"22px", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"4px", background:"transparent", border:"none", color:muted, cursor:"pointer", fontSize:"18px", lineHeight:1 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"; (e.currentTarget as HTMLButtonElement).style.color = text; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = muted; }}
            >+</button>
          )}
        </div>

        {sidebarView !== "trash" && (
          <div style={{ position:"relative" }}>
            <svg style={{ position:"absolute", left:"9px", top:"50%", transform:"translateY(-50%)", color:muted, pointerEvents:"none" }} width="11" height="11" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input ref={searchRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search…  ⌘F"
              style={{ width:"100%", paddingLeft:"28px", paddingRight: query ? "24px" : "10px", paddingTop:"6px", paddingBottom:"6px", borderRadius:"6px", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", border:`1px solid ${borderC}`, color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.6)", fontSize:"12px", outline:"none" }}
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"; }}
              onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = borderC; }}
            />
            {query && <button onClick={() => setQuery("")} style={{ position:"absolute", right:"8px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:muted, cursor:"pointer", fontSize:"10px" }}>✕</button>}
          </div>
        )}
        {sidebarView==="trash" && notes.length > 0 && (
          <p style={{ fontSize:"10px", color:muted, marginTop:"2px" }}>Right-click to restore or permanently delete.</p>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto" style={{ flex:1, padding:"6px" }}>
        {notes.length === 0 ? (
          <EmptyState view={sidebarView} isDark={isDark} onCreateNote={onCreateNote} />
        ) : filtered.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"120px", textAlign:"center" }}>
            <p style={{ fontSize:"12px", color:muted }}>No notes match "{query}"</p>
          </div>
        ) : (
          <>
            {/* Pinned section */}
            {pinnedCount > 0 && sidebarView !== "trash" && (
              <>
                <p style={{ fontSize:"9px", fontWeight:500, color:muted, textTransform:"uppercase", letterSpacing:"0.08em", padding:"6px 10px 3px" }}>Pinned</p>
                <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:"2px", marginBottom:"4px" }}>
                  {filtered.filter(n => n.isPinned).map((note, i) => (
                    <NoteItem key={note.id} note={note} index={i} query={query}
                      isActive={note.id===activeNoteId} isTrashed={false} isDark={isDark}
                      onSelect={() => onSelectNote(note.id)}
                      onContextMenu={e => handleCtx(e, note.id)}
                    />
                  ))}
                </ul>
                {filtered.filter(n => !n.isPinned).length > 0 && (
                  <p style={{ fontSize:"9px", fontWeight:500, color:muted, textTransform:"uppercase", letterSpacing:"0.08em", padding:"6px 10px 3px" }}>Notes</p>
                )}
              </>
            )}
            {/* Regular notes */}
            <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:"2px" }}>
              {filtered.filter(n => pinnedCount > 0 && sidebarView !== "trash" ? !n.isPinned : true).map((note, i) => (
                <NoteItem key={note.id} note={note} index={i} query={query}
                  isActive={note.id===activeNoteId}
                  isTrashed={sidebarView==="trash"}
                  isDark={isDark}
                  onSelect={() => onSelectNote(note.id)}
                  onContextMenu={e => handleCtx(e, note.id)}
                />
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Context menu */}
      {ctxMenu && (
        <CtxMenuPopup
          ref={menuRef}
          x={ctxMenu.x} y={ctxMenu.y}
          note={notes.find(n => n.id===ctxMenu.noteId)!}
          isTrashView={sidebarView==="trash"}
          isDark={isDark}
          onClose={closeCtx}
          onToggleFavorite={() => { onToggleFavorite(ctxMenu.noteId); closeCtx(); }}
          onTogglePin={() => { onTogglePin(ctxMenu.noteId); closeCtx(); }}
          onDuplicate={() => { onDuplicateNote(ctxMenu.noteId); closeCtx(); }}
          onTrash={() => { onTrashNote(ctxMenu.noteId); closeCtx(); }}
          onRestore={() => { onRestoreNote(ctxMenu.noteId); closeCtx(); }}
          onDeletePermanently={() => { onDeletePermanently(ctxMenu.noteId); closeCtx(); }}
        />
      )}
    </div>
  );
}

// ── NoteItem ──────────────────────────────────────────────

function NoteItem({ note, index, query, isActive, isTrashed, isDark, onSelect, onContextMenu }: {
  note: Note; index: number; query: string; isActive: boolean;
  isTrashed: boolean; isDark: boolean;
  onSelect: () => void; onContextMenu: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const plain   = note.content.replace(/<[^>]+>/g,"").trim();
  const preview = plain.slice(0,70) || "No content yet…";
  const date    = new Date(note.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric"});
  const activeBg = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";
  const hoverBg  = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const titleC   = isActive ? (isDark?"white":"rgba(0,0,0,0.9)") : hovered ? (isDark?"rgba(255,255,255,0.88)":"rgba(0,0,0,0.8)") : (isDark?"rgba(255,255,255,0.62)":"rgba(0,0,0,0.58)");
  const mutedC   = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.35)";

  return (
    <li onClick={onSelect} onContextMenu={onContextMenu}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ position:"relative", padding:"8px 11px", borderRadius:"7px", cursor:"pointer", userSelect:"none", background: isActive ? activeBg : hovered ? hoverBg : "transparent", opacity: isTrashed ? 0.55 : 1, transition:"background 0.1s", animationName:"fadeSlideIn", animationDuration:"200ms", animationTimingFunction:"ease-out", animationFillMode:"both", animationDelay:`${index*22}ms` }}
    >
      {/* Color accent bar */}
      {note.color && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"2px", borderRadius:"1px", background:note.color, opacity: isActive ? 1 : 0.5 }} />}
      {/* Active indigo bar (when no color) */}
      {!note.color && <div style={{ position:"absolute", left:0, top:"10px", bottom:"10px", width:"2px", borderRadius:"99px", background:"#6366f1", opacity: isActive ? 1 : 0, transition:"opacity 0.15s" }} />}

      <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
        <span style={{ fontSize:"13px", flexShrink:0, lineHeight:1 }}>{note.emoji||"📄"}</span>
        <div style={{ flex:1, minWidth:0 }}>
          {/* Title row */}
          <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
            {note.isPinned  && <span style={{ fontSize:"9px", opacity:0.55 }}>📌</span>}
            {note.isFavorite && <span style={{ fontSize:"9px" }}>⭐</span>}
            <p style={{ fontSize:"13px", fontWeight:500, color:titleC, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", flex:1, margin:0, lineHeight:1.3 }}>
              <Highlight text={note.title?.trim()||"Untitled"} query={query} />
            </p>
          </div>
          {/* Preview + date */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"6px", marginTop:"2px" }}>
            <p style={{ fontSize:"11px", color:mutedC, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", flex:1, margin:0 }}>
              <Highlight text={preview} query={query} />
            </p>
            <span style={{ fontSize:"10px", color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.28)", flexShrink:0 }}>{date}</span>
          </div>
          {/* Tags */}
          {note.tags.length > 0 && (
            <div style={{ display:"flex", gap:"3px", marginTop:"4px", flexWrap:"wrap" }}>
              {note.tags.slice(0,3).map(tag => (
                <span key={tag} style={{ fontSize:"9px", padding:"1px 5px", borderRadius:"99px", background: isDark ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.12)", color:"#818cf8" }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

// ── Context menu ──────────────────────────────────────────

interface CtxMenuPopupProps {
  x:number; y:number; note:Note; isTrashView:boolean; isDark:boolean;
  onClose:()=>void; onToggleFavorite:()=>void; onTogglePin:()=>void;
  onDuplicate:()=>void; onTrash:()=>void; onRestore:()=>void; onDeletePermanently:()=>void;
}

const CtxMenuPopup = forwardRef<HTMLDivElement, CtxMenuPopupProps>(
  function CtxMenuPopup({ x, y, note, isTrashView, isDark, onToggleFavorite, onTogglePin, onDuplicate, onTrash, onRestore, onDeletePermanently }, ref) {
    const bg  = isDark ? "#2c2c2c" : "#ffffff";
    const bdr = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
    return (
      <div ref={ref} className="animate-contextMenuIn"
        style={{ position:"fixed", top:y, left:x, zIndex:9999, width:"215px", backgroundColor:bg, border:`1px solid ${bdr}`, borderRadius:"10px", boxShadow:"0 20px 60px rgba(0,0,0,0.5)", padding:"4px 0", overflow:"hidden" }}
      >
        <div style={{ padding:"8px 12px", borderBottom:`1px solid ${bdr}`, marginBottom:"4px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <span style={{ fontSize:"14px" }}>{note.emoji||"📄"}</span>
            <p style={{ fontSize:"11px", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{note.title?.trim()||"Untitled"}</p>
          </div>
        </div>
        {isTrashView ? (
          <>
            <MI icon="↩️" label="Restore note"         onClick={onRestore}            isDark={isDark} />
            <MI icon="🗑️" label="Delete permanently"   onClick={onDeletePermanently}  isDark={isDark} danger />
          </>
        ) : (
          <>
            <MI icon={note.isFavorite ? "★":"☆"} label={note.isFavorite ? "Remove from favorites":"Add to favorites"} onClick={onToggleFavorite} isDark={isDark} accent={note.isFavorite} />
            <MI icon={note.isPinned ? "📌":"📍"} label={note.isPinned ? "Unpin note":"Pin to top"} onClick={onTogglePin} isDark={isDark} />
            <MI icon="📋" label="Duplicate note"        onClick={onDuplicate}          isDark={isDark} />
            <div style={{ margin:"4px 0", borderTop:`1px solid ${bdr}` }} />
            <MI icon="🗑️" label="Move to trash"        onClick={onTrash}              isDark={isDark} danger />
          </>
        )}
      </div>
    );
  }
);

function MI({ icon, label, onClick, isDark, danger=false, accent=false }: {
  icon:string; label:string; onClick:()=>void; isDark:boolean; danger?:boolean; accent?:boolean;
}) {
  const [hov, setHov] = useState(false);
  const base  = danger ? "rgba(248,113,113,0.75)" : accent ? "rgba(250,204,21,0.8)" : isDark ? "rgba(255,255,255,0.62)" : "rgba(0,0,0,0.65)";
  const hoverC = danger ? "#f87171" : accent ? "#fde047" : isDark ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.88)";
  const hoverBg = danger ? "rgba(248,113,113,0.08)" : accent ? "rgba(250,204,21,0.07)" : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"7px 12px", background: hov ? hoverBg : "transparent", border:"none", color: hov ? hoverC : base, cursor:"pointer", fontSize:"12px", textAlign:"left", transition:"all 0.1s" }}
    >
      <span style={{ width:"16px", textAlign:"center", fontSize:"13px", flexShrink:0 }}>{icon}</span>
      <span style={{ flex:1 }}>{label}</span>
    </button>
  );
}

function Highlight({ text, query }: { text:string; query:string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>{text.slice(0,idx)}<mark style={{ background:"rgba(250,204,21,0.2)", color:"rgba(253,224,71,0.9)", borderRadius:"2px", padding:"0 1px", fontStyle:"normal" }}>{text.slice(idx, idx+query.length)}</mark>{text.slice(idx+query.length)}</>
  );
}

function EmptyState({ view, isDark, onCreateNote }: { view:SidebarView; isDark:boolean; onCreateNote:()=>void }) {
  const muted  = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)";
  const border = isDark ? "rgba(255,255,255,0.1)"  : "rgba(0,0,0,0.1)";
  const cfg = { all:{icon:"📝",text:"No notes yet.\nCreate your first note.",btn:true}, favorites:{icon:"⭐",text:"No favorites yet.\nRight-click any note to star it.",btn:false}, trash:{icon:"🗑️",text:"Trash is empty.",btn:false} }[view];
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"180px", textAlign:"center", padding:"0 16px" }}>
      <div style={{ fontSize:"28px", opacity:0.2, marginBottom:"10px" }}>{cfg.icon}</div>
      <p style={{ fontSize:"12px", color:muted, lineHeight:1.6, whiteSpace:"pre-line" }}>{cfg.text}</p>
      {cfg.btn && <button onClick={onCreateNote} style={{ marginTop:"14px", padding:"6px 14px", fontSize:"11px", color:muted, background:"transparent", border:`1px solid ${border}`, borderRadius:"6px", cursor:"pointer" }}>+ New note</button>}
    </div>
  );
}