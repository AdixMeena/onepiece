# ⚡ Pluton — AI-Powered EdTech Platform

> Learn Beyond Limits. Personalized AI learning for every student.

## 🚀 Features

| Feature | Description |
|--------|-------------|
| 🎥 YT Summarizer | Paste any YouTube link → AI generates smart notes by your level |
| 📄 PDF Extractor | Upload PDFs → extract key Q&A and notes |
| 🧠 Quiz Lab | Generate MCQ quizzes from any topic or your notes |
| 💬 Doubt Finisher | AI chat assistant in Hinglish |
| 🗺️ Roadmap Tracker | AI generates personalized learning paths per subject |
| ✅ To-Do & Journal | Daily planner + personal study journal |
| 👤 Profile | XP, achievements, quiz history, level tracking |

---

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **AI**: GitHub Models (GPT-4o) — free via GitHub Student Pack
- **Database + Auth**: Supabase
- **Deploy**: Vercel (frontend) + Railway (if backend needed)

---

## ⚙️ Setup Guide

### 1. Clone and install
```bash
git clone <your-repo>
cd pluton
npm install
```

### 2. Set up Supabase
1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to **SQL Editor** → paste contents of `supabase-schema.sql` → Run
3. Go to **Project Settings → API** → copy `URL` and `anon public` key

### 3. Get GitHub Models API key (FREE via Student Pack)
1. Go to [github.com/marketplace/models](https://github.com/marketplace/models)
2. Click any model → **"Get API Key"** → Generate token
3. This gives you access to GPT-4o, Claude, Llama — for free!

### 4. Create `.env` file
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GITHUB_TOKEN=your-github-models-token
VITE_AI_MODEL=openai/gpt-4o
```

### 5. Run locally
```bash
npm run dev
```

---

## 🌐 Deploy to Vercel

```bash
npm run build
# Then push to GitHub and connect to Vercel
# Add your .env variables in Vercel → Settings → Environment Variables
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── AppLayout.jsx      # Main layout with sidebar + mobile nav
│   ├── Sidebar.jsx        # Navigation sidebar
│   ├── StarField.jsx      # Cosmic background animation
│   └── ProtectedRoute.jsx # Auth guard
├── context/
│   └── AuthContext.jsx    # Global auth state
├── lib/
│   └── clients.js         # Supabase + GitHub Models AI setup
├── pages/
│   ├── Landing.jsx        # Public landing page
│   ├── Auth.jsx           # Login / Signup
│   ├── Dashboard.jsx      # Home with subjects & stats
│   ├── YTSummarizer.jsx   # YouTube → AI notes
│   ├── PDFExtractor.jsx   # PDF → notes + Q&A
│   ├── QuizLab.jsx        # Quiz generator + taker
│   ├── DoubtFinisher.jsx  # AI chat
│   ├── Roadmap.jsx        # Subject roadmap tracker
│   ├── TodoJournal.jsx    # To-do + journal
│   └── Profile.jsx        # User profile + achievements
├── App.jsx                # Router setup
├── main.jsx               # Entry point
└── index.css              # Global cosmic styles
```

---

## 🎨 Design System

- **Colors**: Cosmic dark theme — deep space blues + nebula purples + aurora greens
- **Fonts**: Syne (headings) + DM Sans (body) + JetBrains Mono (code)
- **Components**: Glass morphism cards with blur effects
- **Responsive**: Full mobile support with bottom nav

---

## 🤝 GitHub Student Pack Benefits Used

- ✅ **GitHub Models** — Free GPT-4o AI via Azure endpoint
- ✅ **Vercel** — Free frontend hosting
- ✅ **Namecheap** — Free .me domain (apply separately)
- ✅ **Supabase** — Free tier database (25k MAU)

---

Built with 💜 for students who want to learn smarter, not harder.
