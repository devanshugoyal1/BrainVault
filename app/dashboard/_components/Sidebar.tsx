"use client";

import { SidebarView } from "../page";

interface SidebarProps {
  onCreateNote: () => void;
  onOpenTemplates: () => void;
  counts: { all: number; favorites: number; trash: number };
  activeView: SidebarView;
  onChangeView: (view: SidebarView) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onOpenPalette: () => void;
  allTags: string[];
  activeTag: string | null;
  onSelectTag: (tag: string) => void;
}

const PALETTE = [
  { bg:"rgba(99,102,241,0.18)",  text:"#818cf8" },
  { bg:"rgba(16,185,129,0.18)",  text:"#34d399" },
  { bg:"rgba(245,158,11,0.18)",  text:"#fbbf24" },
  { bg:"rgba(239,68,68,0.18)",   text:"#f87171" },
  { bg:"rgba(236,72,153,0.18)",  text:"#f472b6" },
  { bg:"rgba(14,165,233,0.18)",  text:"#38bdf8" },
];

function tagColor(tag: string) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = tag.charCodeAt(i) + ((h<<5)-h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

export default function Sidebar({
  onCreateNote, onOpenTemplates, counts, activeView, onChangeView,
  theme, onToggleTheme, onOpenPalette,
  allTags, activeTag, onSelectTag,
}: SidebarProps) {
  const isDark   = theme === "dark";
  const bg       = isDark ? "#202020" : "#ebebeb";
  const text     = isDark ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.85)";
  const muted    = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.4)";
  const borderC  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const hoverBg  = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const activeBg = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";

  const btnStyle = (active = false) => ({
    width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"7px 10px",
    borderRadius:"8px", background: active ? activeBg : "transparent",
    color: active ? text : muted, border:"none", cursor:"pointer",
    fontSize:"13px", textAlign:"left" as const, transition:"all 0.1s",
  });

  return (
    <aside style={{ width:"260px", minWidth:"260px", maxWidth:"260px", height:"100%", backgroundColor:bg, display:"flex", flexDirection:"column", flexShrink:0, color:text, overflow:"hidden", borderRight:`1px solid ${borderC}`, transition:"background 0.2s" }}>

      {/* Branding */}
      <div style={{ padding:"16px 16px 13px", borderBottom:`1px solid ${borderC}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <img src="/brand/logo.png" alt="BrainVault" style={{ width:"32px", height:"32px", minWidth:"32px", maxWidth:"32px", borderRadius:"8px", objectFit:"contain" }} />
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:"14px", fontWeight:600, color:text, lineHeight:1, margin:0 }}>BrainVault</p>
            <p style={{ fontSize:"11px", color:muted, marginTop:"3px", lineHeight:1 }}>Personal Knowledge</p>
          </div>
          <button onClick={onToggleTheme} title={isDark ? "Light mode" : "Dark mode"}
            style={{ width:"26px", height:"26px", borderRadius:"6px", border:`1px solid ${borderC}`, background:"transparent", cursor:"pointer", fontSize:"13px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:muted, transition:"all 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = hoverBg; (e.currentTarget as HTMLButtonElement).style.color = text; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = muted; }}
          >{isDark ? "☀️" : "🌙"}</button>
        </div>
      </div>

      {/* Search / command palette */}
      <div style={{ padding:"10px 10px 4px" }}>
        <button onClick={onOpenPalette}
          style={{ width:"100%", display:"flex", alignItems:"center", gap:"8px", padding:"7px 10px", borderRadius:"8px", border:`1px solid ${borderC}`, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)", cursor:"pointer", color:muted, fontSize:"12px", textAlign:"left", transition:"all 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"; (e.currentTarget as HTMLButtonElement).style.color = text; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = borderC; (e.currentTarget as HTMLButtonElement).style.color = muted; }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0 }}>
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ flex:1 }}>Search everything…</span>
          <kbd style={{ fontSize:"9px", background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", padding:"2px 5px", borderRadius:"4px", color:muted }}>⌘K</kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ padding:"6px 10px 0", display:"flex", flexDirection:"column", gap:"2px" }}>
        <NavBtn icon="🏠" label="All Notes"  count={counts.all}       active={activeView==="all"}       style={btnStyle(activeView==="all")}       onClick={() => onChangeView("all")}       isDark={isDark} />
        <NavBtn icon="⭐" label="Favorites"  count={counts.favorites}  active={activeView==="favorites"} style={btnStyle(activeView==="favorites")} onClick={() => onChangeView("favorites")} isDark={isDark} />
        <NavBtn icon="🗑️" label="Trash"      count={counts.trash}     active={activeView==="trash"}     style={btnStyle(activeView==="trash")}     onClick={() => onChangeView("trash")}     isDark={isDark} />
      </nav>

      {/* Templates */}
      <div style={{ padding:"6px 10px 0" }}>
        <button onClick={onOpenTemplates}
          style={{ ...btnStyle(), color:muted }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = hoverBg; (e.currentTarget as HTMLButtonElement).style.color = text; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = muted; }}
        >
          <span style={{ fontSize:"13px", width:"16px", textAlign:"center" }}>📐</span>
          <span style={{ flex:1 }}>Templates</span>
          <kbd style={{ fontSize:"9px", background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", padding:"2px 5px", borderRadius:"4px", color:muted }}>⌘⇧T</kbd>
        </button>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div style={{ padding:"14px 14px 6px" }}>
          <p style={{ fontSize:"10px", fontWeight:500, color:muted, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 6px" }}>Tags</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
            {allTags.map(tag => {
              const c = tagColor(tag);
              const isAct = activeTag === tag;
              return (
                <button key={tag} onClick={() => onSelectTag(tag)}
                  style={{ display:"inline-flex", alignItems:"center", padding:"3px 9px", borderRadius:"99px", fontSize:"11px", fontWeight:500, cursor:"pointer", border:"none", background: isAct ? c.bg : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"), color: isAct ? c.text : muted, transition:"all 0.15s" }}>
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes count */}
      <div style={{ padding:"14px 14px 4px" }}>
        <p style={{ fontSize:"10px", fontWeight:500, color:muted, textTransform:"uppercase", letterSpacing:"0.08em", margin:0 }}>
          Notes {counts.all > 0 && <span style={{ fontWeight:400, textTransform:"none", letterSpacing:"normal" }}>{counts.all}</span>}
        </p>
      </div>

      <div style={{ flex:1 }} />

      {/* New note */}
      <div style={{ padding:"12px", borderTop:`1px solid ${borderC}` }}>
        <button onClick={onCreateNote}
          style={{ width:"100%", display:"flex", alignItems:"center", gap:"8px", padding:"8px 12px", borderRadius:"8px", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", color:muted, border:"none", cursor:"pointer", fontSize:"13px", transition:"all 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = text; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = muted; }}
        >
          <span style={{ fontSize:"16px", lineHeight:1, fontWeight:300 }}>N</span>
          <span style={{ fontWeight:500 }}>New note</span>
          <span style={{ marginLeft:"auto", fontSize:"10px", opacity:0.5 }}>⌘N</span>
        </button>
      </div>
    </aside>
  );
}

function NavBtn({ icon, label, count, active, style, onClick, isDark }: {
  icon:string; label:string; count?:number; active:boolean;
  style:React.CSSProperties; onClick:()=>void; isDark:boolean;
}) {
  const activeTxt = isDark ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.88)";
  const mutedTxt  = isDark ? "rgba(255,255,255,0.48)" : "rgba(0,0,0,0.45)";
  const hoverBg   = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const activeBg  = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";
  return (
    <button onClick={onClick} style={style}
      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = hoverBg; (e.currentTarget as HTMLButtonElement).style.color = activeTxt; }}}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = mutedTxt; }}}
    >
      <span style={{ fontSize:"13px", width:"16px", textAlign:"center" }}>{icon}</span>
      <span style={{ flex:1 }}>{label}</span>
      {count !== undefined && count > 0 && <span style={{ fontSize:"11px", opacity:0.4 }}>{count}</span>}
    </button>
  );
}