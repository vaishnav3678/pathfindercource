import React, { useState } from 'react';
import { 
  Settings, Key, Database, ShieldCheck, Copy, 
  Check, RefreshCw, AlertTriangle, ExternalLink, Sparkles 
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { dataRepository } from '../../lib/storage';
import { useToast } from '../../components/common/Toast';

const ADMIN_CREDENTIALS_KEY = 'pf_lms_admin_credentials_v1';

export const SettingsAdmin: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('pathfinder3678');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');

  const { success, error } = useToast();
  const supaStatus = isSupabaseConfigured();

  const handleUpdateAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword || newAdminPassword.length < 6) {
      error('Password must be at least 6 characters long.');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      error('Passwords do not match.');
      return;
    }

    try {
      const credentials = {
        username: currentUsername,
        email: 'admin@pathfinder.edu',
        password: newAdminPassword,
      };
      localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(credentials));
      success('Admin credentials updated successfully! Use new password for next login.');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
    } catch {
      error('Failed to update credentials.');
    }
  };

  const handleResetSeeds = () => {
    if (
      window.confirm(
        'Are you sure you want to restore the platform to the initial seed state? This restores Software Testing & Mobile App Dev courses and initial student assignments.'
      )
    ) {
      dataRepository.resetToSeeds();
      success('Data restored to initial factory seed state.');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const copySqlSchema = () => {
    const sql = `-- PATHFINDER COURSES - SUPABASE POSTGRESQL SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    duration TEXT NOT NULL DEFAULT '40 Hours',
    level TEXT NOT NULL DEFAULT 'Beginner to Advanced',
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
    status TEXT NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`;

    navigator.clipboard.writeText(sql);
    setCopied(true);
    success('Supabase SQL schema copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          <span>Platform Settings & Database Integration</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage administrator credentials, Supabase PostgreSQL connection, and deployment guidelines.
        </p>
      </div>

      {/* Supabase Status Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                supaStatus
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Supabase PostgreSQL Connection</h3>
              <p className="text-xs text-slate-400">
                {supaStatus
                  ? 'Connected to live Supabase backend. All tables and RLS are active.'
                  : 'Currently operating in hybrid local storage mode with instant reactivity. Ready to connect to your Supabase project.'}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              supaStatus
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {supaStatus ? 'Live Connected' : 'Hybrid Local Mode'}
          </span>
        </div>

        {/* Step-by-Step Connection Instructions */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs text-slate-300">
          <h4 className="font-bold text-slate-200">How to link your Supabase Project:</h4>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
            <li>
              Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">supabase.com</a> and create a new project.
            </li>
            <li>
              Open the <strong>SQL Editor</strong> tab in Supabase dashboard and run the schema file located in <code className="text-indigo-300">supabase/schema.sql</code> (or click copy below).
            </li>
            <li>
              Copy your <strong>Project URL</strong> and <strong>anon public API key</strong> from Project Settings → API.
            </li>
            <li>
              In your environment or Vercel Environment Variables, configure:
              <div className="font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-indigo-300 mt-1">
                VITE_SUPABASE_URL=https://your-project.supabase.co<br />
                VITE_SUPABASE_ANON_KEY=your-anon-key-here
              </div>
            </li>
          </ol>

          <button
            onClick={copySqlSchema}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Schema Copied!' : 'Copy Supabase SQL Schema'}</span>
          </button>
        </div>
      </div>

      {/* Admin Credentials Manager */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Administrator Credentials</h3>
            <p className="text-xs text-slate-400">
              Change the initial password (<span className="font-mono text-indigo-300">Pawar@3678</span>) for production security.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateAdminPassword} className="space-y-4 max-w-md pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Admin Username
            </label>
            <input
              type="text"
              value={currentUsername}
              onChange={(e) => setCurrentUsername(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
              placeholder="Enter new strong password"
              className="w-full p-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmAdminPassword}
              onChange={(e) => setConfirmAdminPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full p-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Update Admin Password
          </button>
        </form>
      </div>

      {/* Deployment & Vercel Guide */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-indigo-400" />
          <span>Vercel Deployment Workflow</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Pathfinder Courses includes <code className="text-indigo-300">vercel.json</code> configured for clean client-side routing rewrites.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-indigo-400">1. GitHub</span>
            <p className="text-slate-400 text-[11px]">Push repository to your GitHub account.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-indigo-400">2. Vercel Import</span>
            <p className="text-slate-400 text-[11px]">Select repository in Vercel with Vite framework preset.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-indigo-400">3. Env Variables</span>
            <p className="text-slate-400 text-[11px]">Add VITE_SUPABASE_URL & ANON_KEY in Vercel settings.</p>
          </div>
        </div>
      </div>

      {/* Danger Zone: Factory Reset Data */}
      <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/20 space-y-3">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-sm font-bold">Data Maintenance</h3>
        </div>
        <p className="text-xs text-slate-400">
          Need to test the initial setup again? This will restore the default Software Testing and Mobile App Development courses and student assignments.
        </p>
        <button
          onClick={handleResetSeeds}
          className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset to Default Courses & Enrollments</span>
        </button>
      </div>
    </div>
  );
};
