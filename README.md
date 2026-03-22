# 🧠 BrainVault — Your Second Brain, Beautifully Organized

> A full-stack personal knowledge management system. Capture ideas, organize with tags, and write with a powerful rich-text editor — all synced to the cloud.

![BrainVault Banner](public/brand/logo.png)

[![Next.js](https://img.shields.io/badge/Next.js-16.1.7-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Known Issues & Fixes Applied](#-known-issues--fixes-applied)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

BrainVault is a **BCA 6th Semester Major Project** built with Web & Mobile Technologies. It is a full-stack, cloud-synced note-taking app inspired by tools like Notion and Obsidian — but simpler, faster, and yours.

Users can create, edit, organize, tag, favorite, pin, and trash notes — all with real-time auto-save and a beautiful dark-themed UI.

---

## 🚀 Live Demo

| Environment | URL |
|---|---|
| Production | [brain-vault-one.vercel.app](https://brain-vault-one.vercel.app) |
| Dashboard | [brain-vault-one.vercel.app/dashboard](https://brain-vault-one.vercel.app/dashboard) |

---

## ✨ Features

### Core Features
- 📝 **Rich Text Editor** — Powered by Tiptap with support for headings (H1–H3), bold, italic, bullet lists, numbered lists, blockquotes, inline code, and horizontal rules
- 💾 **Auto-Save** — Notes save automatically with a debounced 600ms save after every keystroke, with a visual "Saving…" / "Saved" indicator
- 🗂️ **Note Organization** — Organize notes by All Notes, Favorites, and Trash views
- 📌 **Pin Notes** — Pin important notes to always appear at the top of the list
- ⭐ **Favorites** — Mark notes as favorites for quick access
- 🗑️ **Trash & Restore** — Move notes to trash, restore them, or permanently delete
- 🏷️ **Tags** — Add custom tags to notes and filter by tag in the sidebar
- 🎨 **Note Colors** — Assign accent colors to notes (Indigo, Blue, Teal, Green, Amber, Red, Pink, Purple)
- 😀 **Note Emojis** — Set a custom emoji icon for each note
- 📋 **Templates** — Pre-built templates: Daily Journal, Meeting Notes, Project Brief, and more
- 🔍 **Search** — Full-text search across all note titles and content previews
- ⌨️ **Keyboard Shortcuts** — Full keyboard navigation (⌘K, ⌘N, ⌘⇧F, ⌘⇧T, Backspace to trash, ↑↓ arrow navigation)
- 📤 **Export** — Export any note as a Markdown (.md) file
- 🎭 **Focus Mode** — Distraction-free writing mode
- 🌙 **Dark / Light Theme** — Toggle between dark and light modes, persisted via localStorage
- 📋 **Command Palette** — Quick actions via ⌘K

### Technical Features
- ⚡ Server-side API routes with Next.js App Router
- 🔄 Optimistic UI updates for instant feedback
- 🛡️ Mongoose schema validation with proper defaults
- 🔌 Singleton MongoDB connection pattern for serverless environments
- 📱 Fully responsive layout

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + inline styles |
| **Rich Text Editor** | Tiptap (with StarterKit + Placeholder) |
| **Database** | MongoDB Atlas |
| **ODM** | Mongoose |
| **Deployment** | Vercel |
| **Package Manager** | npm |

---

## 📁 Project Structure

```
brainvault/
├── app/
│   ├── api/
│   │   └── notes/
│   │       ├── route.ts          # GET all notes, POST new note
│   │       └── [id]/
│   │           └── route.ts      # PATCH update note, DELETE note
│   ├── dashboard/
│   │   ├── _components/
│   │   │   ├── Sidebar.tsx       # Left sidebar with navigation & tags
│   │   │   ├── NotesList.tsx     # Middle panel note list
│   │   │   ├── Editor.tsx        # Right panel rich text editor
│   │   │   ├── CommandPalette.tsx
│   │   │   └── TemplateModal.tsx
│   │   └── page.tsx              # Dashboard page (main app logic)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global styles, animations, ProseMirror styles
│   └── about/
│       └── page.tsx
├── lib/
│   └── mongodb.ts                # Mongoose singleton connection
├── models/
│   └── Note.ts                   # Mongoose Note schema
├── public/
│   └── brand/
│       └── logo.png
├── types/
│   ├── routes.d.ts
│   └── validator.ts
├── .env.local                    # Environment variables (not committed)
├── next.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account and cluster

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/devanshugoyal1/BrainVault.git
cd brainvault
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables** (see [Environment Variables](#-environment-variables)):
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open your browser:**
```
http://localhost:3000
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/brainvault?retryWrites=true&w=majority
```

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | Full MongoDB Atlas connection string | ✅ Yes |

> ⚠️ **Security Note:** Never commit your `.env.local` file to version control. It is already included in `.gitignore`.

### MongoDB Atlas Setup

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write access
3. Under **Network Access**, add `0.0.0.0/0` to allow connections from Vercel's dynamic IPs
4. Get your connection string from **Connect → Drivers** and replace `<password>` with your actual password
5. Make sure the database name in the URI is `brainvault`

---

## 📡 API Reference

### Notes

#### `GET /api/notes`
Returns all non-trashed notes, sorted by pinned first then by `updatedAt` descending.

**Response:**
```json
[
  {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "title": "My Note",
    "content": "<p>Hello world</p>",
    "isFavorite": false,
    "isTrashed": false,
    "isPinned": false,
    "tags": ["work", "ideas"],
    "emoji": "📝",
    "color": "#6366f1",
    "createdAt": "2026-03-21T10:00:00.000Z",
    "updatedAt": "2026-03-21T10:05:00.000Z"
  }
]
```

#### `POST /api/notes`
Creates a new note.

**Request Body:**
```json
{
  "title": "New Note",
  "content": "",
  "isFavorite": false,
  "isTrashed": false,
  "isPinned": false,
  "tags": [],
  "emoji": "📝",
  "color": ""
}
```

#### `PATCH /api/notes/[id]`
Updates a note by ID. Accepts any subset of note fields.

**Request Body (partial):**
```json
{
  "title": "Updated Title",
  "content": "<p>Updated content</p>",
  "isFavorite": true
}
```

#### `DELETE /api/notes/[id]`
Permanently deletes a note by ID.

---

## 🌐 Deployment

BrainVault is deployed on **Vercel** with automatic deployments on every push to the `master` branch.

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add the `MONGODB_URI` environment variable under **Settings → Environment Variables**
4. Deploy — Vercel will build and deploy automatically

### Important Vercel Settings

- **Production Branch:** `master`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Node.js Version:** 18.x

> After updating environment variables in Vercel, always trigger a **Redeploy** for changes to take effect.

---

## 🐛 Known Issues & Fixes Applied

During development and deployment, the following issues were identified and resolved:

| Issue | Root Cause | Fix Applied |
|---|---|---|
| Dashboard 404 on Vercel | Invalid `eslint` key in `next.config.ts` | Removed invalid key, added `typescript.ignoreBuildErrors` |
| `GET /api/notes` returning 500 | Wrong MongoDB URI in Vercel env vars | Updated to correct connection string with proper password |
| Notes fetched with `userId: "local"` filter missing notes | Old notes created before userId field existed | Changed query to `$or: [{ isTrashed: false }, { isTrashed: { $exists: false } }]` |
| Deleted notes reappearing on reload | Trashed notes being returned by GET query | Added `isTrashed: false` filter to GET route |
| Content not saving after typing | Stale closure in `useEditor` `onUpdate` callback | Used `useRef` for `note` and `title` to prevent stale closures |
| PATCH returning 404 | Note ID was `undefined` due to stale closure | Replaced `note.id` with `noteRef.current.id` in debounced save |
| `debouncedSave` resetting on each render | `useCallback(debounce(...), [note?.id])` recreated debounce | Replaced with `useRef(debounce(...))` for stable reference |
| Duplicate `titleRef` declaration | Old `useRef<HTMLInputElement>(null)` conflicting with new `useRef<string>` | Removed old declaration, used separate ref for input element |
| `next.config.ts` duplicate declaration | Two `nextConfig` constants in same file | Cleaned to single declaration |

---

## 📸 Screenshots

### Landing Page
A sleek dark-themed landing page with a hero section and app preview.

### Dashboard
A three-panel layout: sidebar (navigation + tags), note list (with search), and rich text editor.

### Rich Text Editor
Full formatting toolbar with auto-save indicator, emoji picker, color picker, tag system, and export.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Devanshu Goyal**
- GitHub: [@devanshugoyal1](https://github.com/devanshugoyal1)
- Project: BCA 6th Semester Major Project — Web & Mobile Technologies

---

> ⭐ If you found this project helpful, please consider giving it a star on GitHub!