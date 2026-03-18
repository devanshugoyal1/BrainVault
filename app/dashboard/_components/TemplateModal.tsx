"use client";

import { Note } from "../page";

interface TemplateModalProps {
  theme: "dark" | "light";
  onSelect: (tpl: Partial<Note>) => void;
  onClose: () => void;
}

const TEMPLATES = [
  {
    emoji: "📋",
    name: "Meeting Notes",
    description: "Agenda, attendees, action items",
    color: "#3b82f6",
    content: `<h2>Meeting Notes</h2><p><strong>Date:</strong> ${new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p><p><strong>Attendees:</strong> </p><hr><h3>Agenda</h3><ul><li></li><li></li><li></li></ul><h3>Discussion</h3><p></p><h3>Action Items</h3><ul><li> — Owner: </li><li> — Owner: </li></ul><h3>Next Meeting</h3><p></p>`,
  },
  {
    emoji: "📔",
    name: "Daily Journal",
    description: "Gratitude, goals, reflection",
    color: "#8b5cf6",
    content: `<h2>Daily Journal</h2><p><em>${new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</em></p><hr><h3>🌅 Morning Intention</h3><p>Today I want to focus on...</p><h3>✨ Gratitude</h3><ul><li></li><li></li><li></li></ul><h3>🎯 Top 3 Goals for Today</h3><ul><li></li><li></li><li></li></ul><h3>📝 Notes & Thoughts</h3><p></p><h3>🌙 Evening Reflection</h3><p>What went well today...</p><p>What I'd do differently...</p>`,
  },
  {
    emoji: "🚀",
    name: "Project Brief",
    description: "Goals, scope, timeline, team",
    color: "#10b981",
    content: `<h2>Project Brief</h2><hr><h3>Overview</h3><p></p><h3>Goals</h3><ul><li></li><li></li></ul><h3>Scope</h3><p><strong>In scope:</strong> </p><p><strong>Out of scope:</strong> </p><h3>Timeline</h3><ul><li><strong>Start:</strong> </li><li><strong>Milestone 1:</strong> </li><li><strong>Launch:</strong> </li></ul><h3>Team</h3><ul><li></li></ul><h3>Resources</h3><p></p><h3>Risks</h3><ul><li></li></ul>`,
  },
  {
    emoji: "🧠",
    name: "Brain Dump",
    description: "Free-form idea capture",
    color: "#f59e0b",
    content: `<h2>Brain Dump</h2><p><em>No structure — just write everything on your mind.</em></p><hr><p></p>`,
  },
  {
    emoji: "📚",
    name: "Book Notes",
    description: "Summary, quotes, takeaways",
    color: "#ef4444",
    content: `<h2>Book Notes</h2><p><strong>Title:</strong> </p><p><strong>Author:</strong> </p><p><strong>Date Read:</strong> </p><hr><h3>Summary</h3><p></p><h3>Key Ideas</h3><ul><li></li><li></li><li></li></ul><h3>Favourite Quotes</h3><blockquote></blockquote><h3>My Takeaways</h3><p></p><h3>Rating</h3><p>⭐⭐⭐⭐⭐</p>`,
  },
  {
    emoji: "✅",
    name: "To-Do List",
    description: "Simple task checklist",
    color: "#06b6d4",
    content: `<h2>To-Do List</h2><p><em>${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</em></p><hr><h3>High Priority</h3><ul><li></li><li></li></ul><h3>Medium Priority</h3><ul><li></li><li></li></ul><h3>Someday / Maybe</h3><ul><li></li></ul>`,
  },
];

export default function TemplateModal({ theme, onSelect, onClose }: TemplateModalProps) {
  const isDark  = theme === "dark";
  const bg      = isDark ? "#1e1e1e" : "#ffffff";
  const cardBg  = isDark ? "#282828" : "#f8f8f6";
  const border  = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const text    = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)";
  const muted   = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.4)";
  const hoverBg = isDark ? "#303030" : "#f0f0ec";

  return (
    <div
      className="animate-overlayIn"
      onClick={onClose}
      style={{ position:"fixed", inset:0, zIndex:9998, background: isDark ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.3)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center" }}
    >
      <div
        className="animate-paletteIn"
        onClick={e => e.stopPropagation()}
        style={{ width:"min(680px,94vw)", background:bg, border:`1px solid ${border}`, borderRadius:"16px", boxShadow:"0 32px 80px rgba(0,0,0,0.5)", overflow:"hidden" }}
      >
        {/* Header */}
        <div style={{ padding:"20px 24px 16px", borderBottom:`1px solid ${border}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h2 style={{ fontSize:"16px", fontWeight:600, color:text, margin:0 }}>Choose a template</h2>
              <p style={{ fontSize:"12px", color:muted, marginTop:"3px" }}>Start with structure · ⌘⇧T to open anytime</p>
            </div>
            <button onClick={onClose}
              style={{ width:"28px", height:"28px", borderRadius:"6px", border:`1px solid ${border}`, background:"transparent", color:muted, cursor:"pointer", fontSize:"14px" }}>✕</button>
          </div>
        </div>

        {/* Template grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", padding:"16px 20px 20px" }}>
          {TEMPLATES.map(tpl => (
            <button
              key={tpl.name}
              onClick={() => onSelect({ title: tpl.name, content: tpl.content, emoji: tpl.emoji, color: tpl.color, tags: [] })}
              style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"6px", padding:"14px", borderRadius:"10px", border:`1px solid ${border}`, background:cardBg, cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = hoverBg; (e.currentTarget as HTMLButtonElement).style.borderColor = tpl.color + "55"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = cardBg; (e.currentTarget as HTMLButtonElement).style.borderColor = border; }}
            >
              {/* Color bar at top */}
              <div style={{ width:"100%", height:"3px", borderRadius:"99px", background:tpl.color, opacity:0.7 }} />
              <span style={{ fontSize:"22px", lineHeight:1 }}>{tpl.emoji}</span>
              <div>
                <p style={{ fontSize:"13px", fontWeight:600, color:text, margin:0 }}>{tpl.name}</p>
                <p style={{ fontSize:"11px", color:muted, marginTop:"2px" }}>{tpl.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Blank note option */}
        <div style={{ padding:"0 20px 16px" }}>
          <button
            onClick={() => onSelect({ title:"Untitled", content:"", emoji:"📄", color:"", tags:[] })}
            style={{ width:"100%", padding:"10px", borderRadius:"8px", border:`1px dashed ${border}`, background:"transparent", color:muted, cursor:"pointer", fontSize:"13px", transition:"all 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.22)"; (e.currentTarget as HTMLButtonElement).style.color = text; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = border; (e.currentTarget as HTMLButtonElement).style.color = muted; }}
          >
            + Start with a blank note
          </button>
        </div>
      </div>
    </div>
  );
}