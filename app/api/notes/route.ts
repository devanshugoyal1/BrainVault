// app/api/notes/route.ts
// GET  /api/notes        → returns all non-deleted notes
// POST /api/notes        → creates a new note

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";

export async function GET() {
  try {
    await connectDB();
    // Sort: pinned first, then by updatedAt descending
    const notes = await Note.find({ $or: [{ isTrashed: false }, { isTrashed: { $exists: false } }] })
      .sort({ isPinned: -1, updatedAt: -1 })
      .lean()
      .exec();

    // lean() returns plain objects — apply the same transform as toJSON
    const transformed = notes.map((n: any) => ({
      ...n,
      id:        n._id.toString(),
      createdAt: n.createdAt?.toISOString?.() ?? n.createdAt,
      updatedAt: n.updatedAt?.toISOString?.() ?? n.updatedAt,
      _id:       undefined,
      __v:       undefined,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("GET /api/notes error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const note = await Note.create({
      title:      body.title      ?? "Untitled",
      content:    body.content    ?? "",
      isFavorite: body.isFavorite ?? false,
      isTrashed:  body.isTrashed  ?? false,
      isPinned:   body.isPinned   ?? false,
      tags:       body.tags       ?? [],
      emoji:      body.emoji      ?? "📄",
      color:      body.color      ?? "",
      userId:     "local",
    });

    return NextResponse.json(note.toJSON(), { status: 201 });
  } catch (error) {
    console.error("POST /api/notes error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
} 