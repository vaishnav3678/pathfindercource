import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, BookOpen, UserCheck, Video, Calendar, KeyRound, 
  ArrowUpRight, Plus, ExternalLink, ShieldCheck, CheckCircle2, Clock
} from 'lucide-react';
import { dataRepository } from '../../lib/storage';
import { AdminDashboardStats, CourseAccess, Meeting, Course } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalStudents: 0,
    totalCourses: 0,
    activeStudents: 0,
    totalVideos: 0,
    upcomingMeetings: 0,
    totalEnrollments: 0,
  });
  const [recentAccesses, setRecentAccesses] = useState<CourseAccess[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [st, accesses, meets, crs] = await Promise.all([
        dataRepository.getDashboardStats(),
        dataRepository.getCourseAccess(),
        dataRepository.getMeetings(),
        dataRepository.getCourses(),
      ]);
      setStats(st);
      setCourses(crs);
      setRecentAccesses(accesses.slice(0, 5));

      const today = new Date().toISOString().split('T')[0];
      setUpcomingMeetings(meets.filter((m) => m.date >= today).slice(0, 3));
    } catch (e) {
      console.error('Error fetching admin dashboard stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleDataChange = () => loadData();
    window.addEventListener('pf_data_change', handleDataChange);
    return () => window.removeEventListener('pf_data_change', handleDataChange);
  }, []);

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'indigo', link: '/admin/students' },
    { label: 'Active Students', value: stats.activeStudents, icon: UserCheck, color: 'emerald', link: '/admin/students' },
    { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'sky', link: '/admin/courses' },
    { label: 'Course Enrollments', value: stats.totalEnrollments, icon: KeyRound, color: 'amber', link: '/admin/access' },
    { label: 'Total Videos', value: stats.totalVideos, icon: Video, color: 'purple', link: '/admin/videos' },
    { label: 'Upcoming Meetings', value: stats.upcomingMeetings, icon: Calendar, color: 'rose', link: '/admin/meetings' },
  ];

  const getCourseTitle = (id: string) => {
    return courses.find((c) => c.id === id)?.title || 'Course';
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admin Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time management dashboard for Pathfinder Courses
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/access"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Grant Course Access</span>
          </Link>
          <Link
            to="/admin/meetings"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Schedule Meeting</span>
          </Link>
        </div>
      </div>

      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              to={stat.link}
              className="group bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-3xl transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {loading ? '-' : stat.value}
                </span>
                <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                  Manage <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Grid: Recent Access & Upcoming Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Course Access Grants */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <span>Recent Course Access Grants</span>
            </h2>
            <Link
              to="/admin/access"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60">
            {recentAccesses.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No course access granted yet.</p>
            ) : (
              recentAccesses.map((acc) => (
                <div key={acc.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{acc.student_email}</p>
                    <p className="text-[11px] text-indigo-400 mt-0.5">
                      {getCourseTitle(acc.course_id)}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                      acc.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {acc.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Meetings Schedule */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Upcoming Scheduled Meetings</span>
            </h2>
            <Link
              to="/admin/meetings"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingMeetings.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No live sessions scheduled.</p>
            ) : (
              upcomingMeetings.map((meet) => (
                <div
                  key={meet.id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{meet.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {getCourseTitle(meet.course_id)} • {meet.date} at {meet.start_time}
                    </p>
                  </div>
                  <a
                    href={meet.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 transition-colors"
                    title="Open Meeting Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
