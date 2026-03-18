// app/api/notes/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
import mongoose from "mongoose";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const body = await request.json();
    const update: Record<string, unknown> = {};
    if ("title"      in body) update.title      = String(body.title ?? "");
    if ("content"    in body) update.content    = String(body.content ?? "");
    if ("isFavorite" in body) update.isFavorite = Boolean(body.isFavorite);
    if ("isTrashed"  in body) update.isTrashed  = Boolean(body.isTrashed);
    if ("isPinned"   in body) update.isPinned   = Boolean(body.isPinned);
    if ("emoji"      in body) update.emoji      = String(body.emoji ?? "📄");
    if ("color"      in body) update.color      = String(body.color ?? "");
    if ("tags"       in body) update.tags       = Array.isArray(body.tags) ? body.tags : [];
    update.updatedAt = new Date();

    const note = await Note.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

    const n = note as any;
    return NextResponse.json({
      id: n._id.toString(), title: n.title, content: n.content,
      isFavorite: n.isFavorite, isTrashed: n.isTrashed, isPinned: n.isPinned,
      tags: n.tags, emoji: n.emoji, color: n.color,
      createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
      updatedAt: n.updatedAt instanceof Date ? n.updatedAt.toISOString() : n.updatedAt,
    });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    await Note.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}