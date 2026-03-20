"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import Sidebar from "./_components/Sidebar";
import NotesList from "./_components/NotesList";
import Editor from "./_components/Editor";
import CommandPalette from "./_components/CommandPalette";
import TemplateModal from "./_components/TemplateModal";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isTrashed: boolean;
  isPinned: boolean;
  tags: string[];
  emoji: string;
  color: string;
}

export type SidebarView = "all" | "favorites" | "trash";
export type Theme = "dark" | "light";

const THEME_KEY = "brainvault_theme";

// ── API helpers ───────────────────────────────────────────

async function apiGet(): Promise<Note[]> {
  const res = await fetch("/api/notes");
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

async function apiCreate(data: {
  title: string; content: string; isFavorite: boolean;
  isTrashed: boolean; isPinned: boolean; tags: string[];
  emoji: string; color: string;
}): Promise<Note> {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
}

async function apiPatch(id: string, patch: Record<string, unknown>): Promise<void> {
  if (!id || id.startsWith("temp_")) return;
  await fetch(`/api/notes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

async function apiDelete(id: string): Promise<void> {
  if (!id || id.startsWith("temp_")) return;
  await fetch(`/api/notes/${id}`, { method: "DELETE" });
}

export default function Dashboard() {
  const [notes, setNotes]               = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [sidebarView, setSidebarView]   = useState<SidebarView>("all");
  const [theme, setTheme]               = useState<Theme>("dark");
  const [focusMode, setFocusMode]       = useState(false);
  const [cmdOpen, setCmdOpen]           = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [activeTag, setActiveTag]       = useState<string | null>(null);
  const [loading, setLoading]           = useState(true);

  // ── Load ─────────────────────────────────────────────
  useEffect(() => {
    apiGet()
      .then(data => {
        setNotes(data);
        const first = data.find(n => !n.isTrashed);
        if (first) setActiveNoteId(first.id);
      })
      .catch(err => console.error("Load error:", err))
      .finally(() => setLoading(false));

    const t = localStorage.getItem(THEME_KEY) as Theme;
    if (t) setTheme(t);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("light", theme === "light");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // ── Optimistic patch ──────────────────────────────────
  const optimisticPatch = useCallback((id: string, changes: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...changes } : n));
    if (!id || id.startsWith("temp_")) return;
    // Build a clean patch object with only primitive values
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(changes)) {
      if (typeof v === "string" || typeof v === "boolean" || Array.isArray(v)) {
        clean[k] = v;
      }
    }
    apiPatch(id, clean).catch(err => console.error("Patch error:", err));
  }, []);

  // ── Create ────────────────────────────────────────────
  const handleCreateNote = useCallback(async (overrides: {
    title?: string; content?: string; emoji?: string;
    color?: string; tags?: string[];
  } = {}) => {
    const payload = {
      title:      overrides.title      ?? "Untitled",
      content:    overrides.content    ?? "",
      isFavorite: false,
      isTrashed:  false,
      isPinned:   false,
      tags:       overrides.tags       ?? [],
      emoji:      overrides.emoji      ?? "📄",
      color:      overrides.color      ?? "",
    };

    const tempId = `temp_${Date.now()}`;
    const tempNote: Note = {
      ...payload,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes(prev => [tempNote, ...prev]);
    setActiveNoteId(tempId);
    setSidebarView("all");
    setActiveTag(null);

    try {
      const real = await apiCreate(payload);
      setNotes(prev => prev.map(n => n.id === tempId ? real : n));
      setActiveNoteId(real.id);
    } catch (err) {
      console.error("Create failed:", err);
    }
  }, []);

  const handleCreateFromTemplate = useCallback((tpl: Partial<Note>) => {
    handleCreateNote({
      title:   tpl.title   ?? "Untitled",
      content: tpl.content ?? "",
      emoji:   tpl.emoji   ?? "📄",
      color:   tpl.color   ?? "",
      tags:    tpl.tags    ?? [],
    });
    setTemplateOpen(false);
  }, [handleCreateNote]);

  // ── Update ────────────────────────────────────────────
  const handleUpdateNote = useCallback((id: string, title: string, content: string) => {
    optimisticPatch(id, { title, content, updatedAt: new Date().toISOString() });
  }, [optimisticPatch]);

  const handleToggleFavorite = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) optimisticPatch(id, { isFavorite: !note.isFavorite });
  }, [notes, optimisticPatch]);

  const handleTogglePin = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) optimisticPatch(id, { isPinned: !note.isPinned });
  }, [notes, optimisticPatch]);

  const handleSetEmoji = useCallback((id: string, emoji: string) => {
    optimisticPatch(id, { emoji });
  }, [optimisticPatch]);

  const handleSetColor = useCallback((id: string, color: string) => {
    optimisticPatch(id, { color });
  }, [optimisticPatch]);

  const handleAddTag = useCallback((id: string, tag: string) => {
    const note = notes.find(n => n.id === id);
    if (note && !note.tags.includes(tag)) {
      optimisticPatch(id, { tags: [...note.tags, tag] });
    }
  }, [notes, optimisticPatch]);

  const handleRemoveTag = useCallback((id: string, tag: string) => {
    const note = notes.find(n => n.id === id);
    if (note) optimisticPatch(id, { tags: note.tags.filter(t => t !== tag) });
  }, [notes, optimisticPatch]);

  const handleDuplicateNote = useCallback((id: string) => {
    const src = notes.find(n => n.id === id);
    if (!src) return;
    handleCreateNote({
      title:   `${src.title} (copy)`,
      content: src.content,
      emoji:   src.emoji,
      color:   src.color,
      tags:    src.tags,
    });
  }, [notes, handleCreateNote]);

  const handleTrashNote = useCallback((id: string) => {
    optimisticPatch(id, { isTrashed: true, isFavorite: false, isPinned: false });
    if (activeNoteId === id) {
      const next = notes.find(n => !n.isTrashed && n.id !== id);
      setActiveNoteId(next?.id ?? null);
    }
  }, [notes, activeNoteId, optimisticPatch]);

  const handleRestoreNote = useCallback((id: string) => {
    optimisticPatch(id, { isTrashed: false });
  }, [optimisticPatch]);

  const handleDeletePermanently = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      const next = notes.find(n => !n.isTrashed && n.id !== id);
      setActiveNoteId(next?.id ?? null);
    }
    apiDelete(id).catch(err => console.error("Delete error:", err));
  }, [notes, activeNoteId]);

  // ── Keyboard shortcuts ────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA"
        || target.classList.contains("ProseMirror");

      if ((e.metaKey||e.ctrlKey) && e.key==="k") { e.preventDefault(); setCmdOpen(o=>!o); return; }
      if ((e.metaKey||e.ctrlKey) && e.key==="n") { e.preventDefault(); handleCreateNote(); return; }
      if ((e.metaKey||e.ctrlKey) && e.shiftKey && e.key==="F") { e.preventDefault(); setFocusMode(o=>!o); return; }
      if ((e.metaKey||e.ctrlKey) && e.shiftKey && e.key==="T") { e.preventDefault(); setTemplateOpen(true); return; }
      if (e.key==="Escape") { setFocusMode(false); setCmdOpen(false); setTemplateOpen(false); return; }
      if (isTyping) return;
      if ((e.key==="Backspace"||e.key==="Delete") && activeNoteId) { handleTrashNote(activeNoteId); return; }
      const visible = notes.filter(n => !n.isTrashed);
      if (e.key==="ArrowDown") {
        e.preventDefault();
        const i = visible.findIndex(n => n.id === activeNoteId);
        const next = visible[Math.min(i+1, visible.length-1)];
        if (next) setActiveNoteId(next.id);
      }
      if (e.key==="ArrowUp") {
        e.preventDefault();
        const i = visible.findIndex(n => n.id === activeNoteId);
        const prev = visible[Math.max(i-1, 0)];
        if (prev) setActiveNoteId(prev.id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [notes, activeNoteId, handleCreateNote, handleTrashNote]);

  // ── Derived ───────────────────────────────────────────
  const activeNote = notes.find(n => n.id === activeNoteId) ?? null;

  let visibleNotes =
    sidebarView === "favorites" ? notes.filter(n => n.isFavorite && !n.isTrashed) :
    sidebarView === "trash"     ? notes.filter(n => n.isTrashed) :
                                  notes.filter(n => !n.isTrashed);

  if (activeTag) visibleNotes = visibleNotes.filter(n => n.tags.includes(activeTag));

  const sortedVisible = [
    ...visibleNotes.filter(n => n.isPinned),
    ...visibleNotes.filter(n => !n.isPinned),
  ];

  const counts = {
    all:       notes.filter(n => !n.isTrashed).length,
    favorites: notes.filter(n => n.isFavorite && !n.isTrashed).length,
    trash:     notes.filter(n => n.isTrashed).length,
  };

  const allTags = Array.from(new Set(notes.filter(n => !n.isTrashed).flatMap(n => n.tags)));
  const bg = theme === "dark" ? "#282828" : "#f5f5f0";

  if (loading) {
    return (
      <div style={{ display:"flex", height:"100vh", width:"100vw", alignItems:"center", justifyContent:"center", backgroundColor:bg }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:"32px", marginBottom:"12px", opacity:0.3 }}>🧠</div>
          <p style={{ fontSize:"13px", color: theme==="dark" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)" }}>
            Loading BrainVault…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", height:"100vh", width:"100vw", minWidth:0, overflow:"hidden", backgroundColor:bg, position:"fixed", top:0, left:0, right:0, bottom:0 }}>

      {!focusMode && (
        <Sidebar
          onCreateNote={handleCreateNote}
          onOpenTemplates={() => setTemplateOpen(true)}
          counts={counts}
          activeView={sidebarView}
          onChangeView={(v) => { setSidebarView(v); setActiveTag(null); }}
          theme={theme}
          onToggleTheme={() => setTheme(t => t==="dark" ? "light" : "dark")}
          onOpenPalette={() => setCmdOpen(true)}
          allTags={allTags}
          activeTag={activeTag}
          onSelectTag={(t) => setActiveTag(activeTag===t ? null : t)}
        />
      )}

      {!focusMode && (
        <NotesList
          notes={sortedVisible}
          activeNoteId={activeNoteId}
          sidebarView={sidebarView}
          theme={theme}
          onSelectNote={setActiveNoteId}
          onTrashNote={handleTrashNote}
          onRestoreNote={handleRestoreNote}
          onDeletePermanently={handleDeletePermanently}
          onToggleFavorite={handleToggleFavorite}
          onTogglePin={handleTogglePin}
          onDuplicateNote={handleDuplicateNote}
          onCreateNote={handleCreateNote}
        />
      )}

      <Editor
        note={activeNote}
        theme={theme}
        focusMode={focusMode}
        onUpdateNote={handleUpdateNote}
        onToggleFocus={() => setFocusMode(o=>!o)}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onSetEmoji={handleSetEmoji}
        onSetColor={handleSetColor}
        allTags={allTags}
      />

      {cmdOpen && (
        <CommandPalette
          notes={notes.filter(n => !n.isTrashed)}
          theme={theme}
          onSelectNote={(id) => { setActiveNoteId(id); setSidebarView("all"); setCmdOpen(false); setFocusMode(false); }}
          onCreateNote={() => { handleCreateNote(); setCmdOpen(false); }}
          onOpenTemplates={() => { setTemplateOpen(true); setCmdOpen(false); }}
          onToggleTheme={() => setTheme(t => t==="dark" ? "light" : "dark")}
          onToggleFocus={() => { setFocusMode(o=>!o); setCmdOpen(false); }}
          onClose={() => setCmdOpen(false)}
        />
      )}

      {templateOpen && (
        <TemplateModal
          theme={theme}
          onSelect={handleCreateFromTemplate}
          onClose={() => setTemplateOpen(false)}
        />
      )}
    </div>
  );
}