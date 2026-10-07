-- ============================================================
-- PATHFINDER COURSES - SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- ============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Holds Admin & Student users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    duration TEXT NOT NULL DEFAULT '40 Hours',
    level TEXT NOT NULL DEFAULT 'Beginner to Advanced',
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Modules Table
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Videos Table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration TEXT NOT NULL DEFAULT '15 mins',
    duration_seconds INTEGER DEFAULT 900,
    order_index INTEGER NOT NULL DEFAULT 1,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Course Access Table (Assigns courses to students by ID & Email)
CREATE TABLE IF NOT EXISTS public.course_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_email TEXT NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_student_course UNIQUE(student_email, course_id)
);

-- 7. Video Progress Table
CREATE TABLE IF NOT EXISTS public.video_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    watched_seconds INTEGER NOT NULL DEFAULT 0,
    last_watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_student_video UNIQUE(student_id, video_id)
);

-- 8. Meetings Table (Daily live sessions)
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'Google Meet',
    meeting_url TEXT NOT NULL,
    recording_url TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Study Materials Table
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_type TEXT NOT NULL DEFAULT 'PDF',
    file_url TEXT NOT NULL,
    file_size TEXT DEFAULT '2.4 MB',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE, -- NULL for all courses
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Admins full access, Users can read their own profile
CREATE POLICY "Admins full access on profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Courses: Admins full access, Students can only see courses assigned to them
CREATE POLICY "Admins full access on courses" ON public.courses
    FOR ALL USING (public.is_admin());

CREATE POLICY "Students read assigned published courses" ON public.courses
    FOR SELECT USING (
        is_published = true AND EXISTS (
            SELECT 1 FROM public.course_access ca
            JOIN public.profiles p ON p.email = ca.student_email OR p.id = ca.student_id
            WHERE ca.course_id = courses.id
              AND ca.is_active = true
              AND (ca.expires_at IS NULL OR ca.expires_at > NOW())
              AND p.id = auth.uid()
        )
    );

-- Course Access: Admins full access, Students can read their own access
CREATE POLICY "Admins full access on course_access" ON public.course_access
    FOR ALL USING (public.is_admin());

CREATE POLICY "Students read own course_access" ON public.course_access
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (email = course_access.student_email OR id = course_access.student_id)
        )
    );

-- Videos: Admins full access, Students can only view published videos for assigned courses
CREATE POLICY "Admins full access on videos" ON public.videos
    FOR ALL USING (public.is_admin());

CREATE POLICY "Students read assigned course videos" ON public.videos
    FOR SELECT USING (
        is_published = true AND EXISTS (
            SELECT 1 FROM public.course_access ca
            JOIN public.profiles p ON p.email = ca.student_email OR p.id = ca.student_id
            WHERE ca.course_id = videos.course_id
              AND ca.is_active = true
              AND p.id = auth.uid()
        )
    );

-- Meetings: Admins full access, Students read meetings for assigned courses
CREATE POLICY "Admins full access on meetings" ON public.meetings
    FOR ALL USING (public.is_admin());

CREATE POLICY "Students read assigned course meetings" ON public.meetings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.course_access ca
            JOIN public.profiles p ON p.email = ca.student_email OR p.id = ca.student_id
            WHERE ca.course_id = meetings.course_id
              AND ca.is_active = true
              AND p.id = auth.uid()
        )
    );

-- Study Materials: Admins full access, Students read assigned materials
CREATE POLICY "Admins full access on study_materials" ON public.study_materials
    FOR ALL USING (public.is_admin());

CREATE POLICY "Students read assigned course materials" ON public.study_materials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.course_access ca
            JOIN public.profiles p ON p.email = ca.student_email OR p.id = ca.student_id
            WHERE ca.course_id = study_materials.course_id
              AND ca.is_active = true
              AND p.id = auth.uid()
        )
    );

-- Video Progress: Students can manage their own progress, Admins can view
CREATE POLICY "Admins read all video progress" ON public.video_progress
    FOR ALL USING (public.is_admin());

CREATE POLICY "Students manage own video progress" ON public.video_progress
    FOR ALL USING (auth.uid() = student_id);

-- Announcements: Admins full access, Students read relevant announcements
CREATE POLICY "Admins full access on announcements" ON public.announcements
    FOR ALL USING (public.is_admin());

CREATE POLICY "Students read announcements" ON public.announcements
    FOR SELECT USING (
        is_published = true AND (
            course_id IS NULL OR EXISTS (
                SELECT 1 FROM public.course_access ca
                JOIN public.profiles p ON p.email = ca.student_email OR p.id = ca.student_id
                WHERE ca.course_id = announcements.course_id
                  AND ca.is_active = true
                  AND p.id = auth.uid()
            )
        )
    );

-- ============================================================
-- INITIAL SEED DATA
-- ============================================================

-- Courses
INSERT INTO public.courses (id, title, slug, description, image_url, duration, level, is_published)
VALUES 
  ('c1000000-0000-0000-0000-000000000001', 'Software Testing', 'software-testing', 'Master Manual Testing, Automation with Selenium & Cypress, API Testing with Postman, and Test Automation Frameworks from industry experts.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80', '60 Hours', 'Beginner to Advanced', true),
  ('c2000000-0000-0000-0000-000000000002', 'Mobile App Development', 'mobile-app-development', 'Build high-performance native and cross-platform apps using React Native, Flutter, and Android Kotlin with hands-on real-world projects.', 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=800&q=80', '75 Hours', 'Intermediate to Advanced', true)
ON CONFLICT (id) DO NOTHING;

-- Initial Course Assignment for Vaishnav Pawar (Software Testing only)
INSERT INTO public.course_access (student_email, course_id, is_active)
VALUES ('pawarvaishnav267@gmail.com', 'c1000000-0000-0000-0000-000000000001', true)
ON CONFLICT DO NOTHING;
