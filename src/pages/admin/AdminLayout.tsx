import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  Compass, LayoutDashboard, BookOpen, Users, KeyRound, 
  Video, Calendar, FileText, Bell, Settings, LogOut, 
  Menu, X, ExternalLink, ShieldCheck, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { WhatsAppButton } from '../../components/common/WhatsAppButton';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Course Access', path: '/admin/access', icon: KeyRound, highlight: true },
    { name: 'Videos', path: '/admin/videos', icon: Video },
    { name: 'Meetings', path: '/admin/meetings', icon: Calendar },
    { name: 'Study Materials', path: '/admin/materials', icon: FileText },
    { name: 'Announcements', path: '/admin/announcements', icon: Bell },
    { name: 'Settings & Supabase', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white block">
                  PATHFINDER
                </span>
                <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block -mt-1">
                  Admin Panel
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : item.highlight
                      ? 'text-indigo-300 hover:bg-indigo-950/40 hover:text-indigo-200'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/60">
          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Switch to Student View</span>
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                A
              </div>
              <div className="truncate">
                <span className="text-xs font-semibold text-slate-200 block truncate">
                  {user?.full_name || 'Admin'}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  pathfinder3678
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                Pathfinder LMS Administration
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System Operational
            </span>
          </div>
        </header>

        {/* Dynamic Nested Routes */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>

      {/* WhatsApp Support Button */}
      <WhatsAppButton />
    </div>
  );
};
