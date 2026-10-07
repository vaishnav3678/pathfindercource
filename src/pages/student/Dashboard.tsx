import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Video, Calendar, ArrowRight, PlayCircle, Clock, 
  Award, Bell, Sparkles, AlertCircle, CheckCircle, ExternalLink, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataRepository } from '../../lib/storage';
import { Course, Meeting, Announcement } from '../../types';
import { Navbar } from '../../components/common/Navbar';
import { WhatsAppButton } from '../../components/common/WhatsAppButton';

export const StudentDashboard: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStudentData = async () => {
    if (!user) return;
    try {
      // If user is admin viewing student dashboard, show all published courses or preview
      let assigned: Course[] = [];
      if (role === 'admin') {
        const all = await dataRepository.getCourses();
        const videos = await dataRepository.getVideos();
        const meets = await dataRepository.getMeetings();
        assigned = all.filter((c) => c.is_published).map((c) => ({
          ...c,
          videos_count: videos.filter((v) => v.course_id === c.id && v.is_published).length,
          meetings_count: meets.filter((m) => m.course_id === c.id).length,
          progress_percentage: 25,
        }));
      } else {
        // Strict assignment check: Only fetch courses assigned to user's email
        assigned = await dataRepository.getStudentAssignedCourses(user.email);
      }
      setCourses(assigned);

      // Get meetings for assigned courses
      const allMeets = await dataRepository.getMeetings();
      const assignedCourseIds = new Set(assigned.map((c) => c.id));
      const relevantMeets = allMeets.filter((m) => assignedCourseIds.has(m.course_id));
      setMeetings(relevantMeets);

      // Get announcements for assigned courses or global
      const allAnns = await dataRepository.getAnnouncements();
      const relevantAnns = allAnns.filter(
        (a) => !a.course_id || assignedCourseIds.has(a.course_id)
      );
      setAnnouncements(relevantAnns);
    } catch (e) {
      console.error('Error loading student dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();

    // Listen to local storage changes from admin actions
    const handleStorageChange = () => {
      loadStudentData();
    };
    window.addEventListener('pf_data_change', handleStorageChange);
    return () => window.removeEventListener('pf_data_change', handleStorageChange);
  }, [user, role]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeeting = meetings.find((m) => m.date === todayStr && m.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Learning Space</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome to Pathfinder Courses
            </h1>
            <p className="text-base sm:text-lg font-medium text-indigo-300 mt-1">
              Learn. Practice. Grow.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Welcome back, <span className="text-slate-200 font-semibold">{user?.full_name}</span> ({user?.email}). Here are your assigned courses, daily live sessions, and learning materials.
            </p>
          </div>
        </div>

        {/* Live Meeting Alert Banner (if scheduled for today) */}
        {todayMeeting && (
          <div className="rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Today's Live Class
                  </span>
                  <span className="text-xs text-slate-400">
                    {todayMeeting.start_time} - {todayMeeting.end_time}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  {todayMeeting.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                  {todayMeeting.description || 'Interactive live session with industry mentor.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={todayMeeting.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Join Meeting ({todayMeeting.platform})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Assigned Courses Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>Your Assigned Courses</span>
              </h2>
              <p className="text-xs text-slate-400">
                Courses strictly assigned to your student email ({user?.email})
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12 text-center">
              <div className="col-span-full flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400">Loading your assigned courses...</p>
              </div>
            </div>
          ) : courses.length === 0 ? (
            /* Empty State: No courses assigned */
            <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">No Courses Assigned Yet</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                  Your student email <strong className="text-slate-200">({user?.email})</strong> has not been assigned any active course by the administrator.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-left text-xs space-y-2 text-slate-300">
                <p className="font-semibold text-slate-200">How to get access?</p>
                <p>1. Contact Pathfinder support via WhatsApp (+91 8767168411) with your email.</p>
                <p>2. Ask the administrator to open <span className="text-indigo-400 font-mono">/admin/access</span> and assign your course.</p>
              </div>
              <a
                href="https://wa.me/918767168411?text=Hello%20Pathfinder%20Support%2C%20please%20grant%20course%20access%20to%20my%20account%3A%20"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Contact Admin on WhatsApp</span>
              </a>
            </div>
          ) : (
            /* Attractive Course Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="group relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-indigo-500/40 transition-all duration-300 flex flex-col"
                >
                  {/* Thumbnail Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                    
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-white/10">
                      {course.level}
                    </span>

                    <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-950/80 backdrop-blur-md text-slate-300 border border-white/10 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {course.duration}
                    </span>

                    {/* Progress Badge */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-semibold text-slate-200">
                      <span>Progress</span>
                      <span className="text-indigo-400">{course.progress_percentage || 0}%</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-sky-400 h-1.5 transition-all duration-500"
                      style={{ width: `${course.progress_percentage || 0}%` }}
                    />
                  </div>

                  {/* Course Details Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-indigo-400" />
                        <span>{course.videos_count ?? 4} Recorded Lectures</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <span>{course.meetings_count ?? 2} Live Sessions</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/course/${course.id}`}
                      className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-200"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Continue Course</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Announcements section */}
        {announcements.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Important Announcements</span>
            </h3>
            <div className="space-y-2.5">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3.5"
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      ann.priority === 'urgent'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : ann.priority === 'high'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100">{ann.title}</h4>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {ann.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ann.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* WhatsApp Support Button */}
      <WhatsAppButton />
    </div>
  );
};
