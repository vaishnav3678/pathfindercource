import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, LogOut, ShieldCheck, UserCheck, BookOpen, ExternalLink, LifeBuoy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Slogan */}
          <Link to={role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-[spin_20s_linear_infinite]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                PATHFINDER
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-indigo-400 uppercase -mt-1">
                Courses • Learn. Practice. Grow.
              </span>
            </div>
          </Link>

          {/* Right Section Navigation */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {role === 'admin' ? (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/admin"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Admin Control Panel
                    </Link>
                    <Link
                      to="/dashboard"
                      className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white transition-colors"
                      title="Preview how student sees the dashboard"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Student View
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/dashboard"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/10 text-indigo-300 border border-indigo-500/20"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      My Courses
                    </Link>
                  </div>
                )}

                {/* User Info Capsule */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-200 leading-tight">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight truncate max-w-[150px]">
                      {user.email}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-slate-700/80 hover:border-rose-500/30 transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Portal Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
