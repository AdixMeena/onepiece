-- =============================================
-- PLUTON - Complete Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================
-- PROFILES TABLE
-- ==================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  level TEXT DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  bio TEXT,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_active DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- ==================
-- SUBJECTS TABLE
-- ==================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📚',
  color TEXT DEFAULT '#7c3aed',
  description TEXT,
  level TEXT DEFAULT 'Beginner',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own subjects" ON subjects
  FOR ALL USING (auth.uid() = user_id);

-- ==================
-- YT SUMMARIES TABLE
-- ==================
CREATE TABLE IF NOT EXISTS yt_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  video_id TEXT,
  level TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE yt_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own yt_summaries" ON yt_summaries
  FOR ALL USING (auth.uid() = user_id);

-- ==================
-- PDF EXTRACTIONS TABLE
-- ==================
CREATE TABLE IF NOT EXISTS pdf_extractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT,
  level TEXT,
  mode TEXT,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pdf_extractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own pdf_extractions" ON pdf_extractions
  FOR ALL USING (auth.uid() = user_id);

-- ==================
-- QUIZZES TABLE
-- ==================
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  level TEXT,
  score INTEGER,
  total INTEGER,
  questions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own quizzes" ON quizzes
  FOR ALL USING (auth.uid() = user_id);

-- ==================
-- CHAT MESSAGES TABLE
-- ==================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own chat_messages" ON chat_messages
  FOR ALL USING (auth.uid() = user_id);

-- ==================
-- ROADMAPS TABLE
-- ==================
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE UNIQUE,
  roadmap_json TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own roadmaps" ON roadmaps
  FOR ALL USING (auth.uid() = user_id);

-- ==================
-- TODOS TABLE
-- ==================
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  done BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own todos" ON todos
  FOR ALL USING (auth.uid() = user_id);

-- ==================
-- JOURNALS TABLE
-- ==================
CREATE TABLE IF NOT EXISTS journals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT DEFAULT '😊',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own journals" ON journals
  FOR ALL USING (auth.uid() = user_id);

-- ==================
-- INDEXES (Performance)
-- ==================
CREATE INDEX IF NOT EXISTS idx_subjects_user ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_yt_summaries_user ON yt_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_extractions_user ON pdf_extractions(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_user ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_user ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_journals_user ON journals(user_id);

-- ==================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ==================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Done! ✅
SELECT 'Pluton database schema created successfully! 🚀' AS status;
