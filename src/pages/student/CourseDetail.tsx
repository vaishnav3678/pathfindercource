import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, PlayCircle, CheckCircle2, Circle, Clock, 
  Calendar, FileText, Download, ExternalLink, Video as VideoIcon, 
  BookOpen, Bell, Sparkles, Check, ChevronDown, ChevronRight, Share2, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataRepository } from '../../lib/storage';
import { Course, Module, Video, Meeting, StudyMaterial, Announcement, VideoProgress } from '../../types';
import { Navbar } from '../../components/common/Navbar';
import { WhatsAppButton } from '../../components/common/WhatsAppButton';
import { useToast } from '../../components/common/Toast';

export const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [progressList, setProgressList] = useState<VideoProgress[]>([]);
  
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'meetings' | 'materials' | 'announcements'>('content');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Load course data
  const loadData = async () => {
    if (!courseId) return;
    try {
      const c = await dataRepository.getCourseById(courseId);
      if (!c) {
        navigate('/dashboard');
        return;
      }
      setCourse(c);

      // Verify access if user is student
      if (role === 'student' && user?.email) {
        const assigned = await dataRepository.getStudentAssignedCourses(user.email);
        const hasAccess = assigned.some((ac) => ac.id === courseId);
        if (!hasAccess) {
          navigate('/dashboard');
          return;
        }
      }

      const [mods, vids, meets, mats, anns] = await Promise.all([
        dataRepository.getModules(courseId),
        dataRepository.getVideos(courseId),
        dataRepository.getMeetings(courseId),
        dataRepository.getStudyMaterials(courseId),
        dataRepository.getAnnouncements(courseId),
      ]);

      setModules(mods);
      
      const pubVideos = vids.filter((v) => v.is_published);
      setVideos(pubVideos);
      if (pubVideos.length > 0 && !activeVideo) {
        setActiveVideo(pubVideos[0]);
      }

      setMeetings(meets);
      setMaterials(mats);
      setAnnouncements(anns);

      // Default expand all modules
      const expandMap: Record<string, boolean> = {};
      mods.forEach((m) => {
        expandMap[m.id] = true;
      });
      setExpandedModules(expandMap);

      if (user) {
        const progs = await dataRepository.getVideoProgress(user.id, courseId);
        setProgressList(progs);
      }
    } catch (e) {
      console.error('Failed to load course details', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleStorageChange = () => {
      loadData();
    };
    window.addEventListener('pf_data_change', handleStorageChange);
    return () => window.removeEventListener('pf_data_change', handleStorageChange);
  }, [courseId, user]);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const isVideoCompleted = (videoId: string) => {
    return progressList.some((p) => p.video_id === videoId && p.is_completed);
  };

  const handleToggleComplete = async (vid: Video) => {
    if (!user || !courseId) return;
    const nowCompleted = await dataRepository.toggleVideoProgress(user.id, vid.id, courseId);
    
    // Update local state
    setProgressList((prev) => {
      const idx = prev.findIndex((p) => p.video_id === vid.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], is_completed: nowCompleted };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: `prog-${Date.now()}`,
            student_id: user.id,
            video_id: vid.id,
            course_id: courseId,
            is_completed: nowCompleted,
            watched_seconds: 600,
            last_watched_at: new Date().toISOString(),
          },
        ];
      }
    });

    if (nowCompleted) {
      success(`Marked "${vid.title}" as completed!`);
      // Check if all completed for celebration confetti
      const nextCompletedCount = progressList.filter((p) => p.is_completed && p.video_id !== vid.id).length + 1;
      if (nextCompletedCount >= videos.length && videos.length > 0) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        success('🎉 Congratulations! You completed 100% of this course!');
      }
    }
  };

  // Calculate completion percentage
  const completedCount = videos.filter((v) => isVideoCompleted(v.id)).length;
  const progressPercentage = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;

  // Transform video URL into embed iframe URL if YouTube
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      return url;
    } catch {
      return url;
    }
  };

  if (loading || !course) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeeting = meetings.find((m) => m.date === todayStr && m.status !== 'cancelled');
  const upcomingMeetings = meetings.filter((m) => m.date > todayStr && m.status !== 'cancelled');
  const pastMeetings = meetings.filter((m) => m.date < todayStr || m.status === 'completed');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          {/* Course Progress Capsule */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
            <span className="text-xs text-slate-400">Course Progress:</span>
            <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-indigo-400">{progressPercentage}%</span>
            <span className="text-[11px] text-slate-500">
              ({completedCount}/{videos.length} videos)
            </span>
          </div>
        </div>

        {/* Video Player & Main Viewport */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Video Player & Details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Video Frame */}
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-black shadow-2xl border border-slate-800">
              {activeVideo ? (
                activeVideo.video_url.includes('youtube') || activeVideo.video_url.includes('youtu.be') ? (
                  <iframe
                    src={getEmbedUrl(activeVideo.video_url)}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <video
                    src={activeVideo.video_url}
                    controls
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <PlayCircle className="w-12 h-12 text-slate-600 mb-2" />
                  <p className="text-sm">No video selected or available.</p>
                </div>
              )}
            </div>

            {/* Video Control & Meta */}
            {activeVideo && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                      Currently Playing
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                      {activeVideo.title}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {activeVideo.duration}
                    </span>
                  </div>

                  {/* Mark Complete Toggle */}
                  <button
                    onClick={() => handleToggleComplete(activeVideo)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isVideoCompleted(activeVideo.id)
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    }`}
                  >
                    {isVideoCompleted(activeVideo.id) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Completed ✓</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" />
                        <span>Mark as Completed</span>
                      </>
                    )}
                  </button>
                </div>

                {activeVideo.description && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                    {activeVideo.description}
                  </p>
                )}
              </div>
            )}

            {/* Secondary Content Tabs */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="flex border-b border-slate-800 px-4 bg-slate-950/60 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'content'
                      ? 'border-indigo-500 text-indigo-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Overview & Syllabus
                </button>
                <button
                  onClick={() => setActiveTab('meetings')}
                  className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'meetings'
                      ? 'border-indigo-500 text-indigo-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Live Meetings ({meetings.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('materials')}
                  className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'materials'
                      ? 'border-indigo-500 text-indigo-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Study Materials ({materials.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('announcements')}
                  className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'announcements'
                      ? 'border-indigo-500 text-indigo-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Announcements ({announcements.length})</span>
                </button>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'content' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white">{course.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {course.description}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
                      <div>
                        <span className="block text-slate-500 text-[10px] uppercase font-bold">Duration</span>
                        <span className="font-semibold text-slate-200">{course.duration}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[10px] uppercase font-bold">Difficulty</span>
                        <span className="font-semibold text-slate-200">{course.level}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[10px] uppercase font-bold">Total Videos</span>
                        <span className="font-semibold text-slate-200">{videos.length} Lectures</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[10px] uppercase font-bold">Total Modules</span>
                        <span className="font-semibold text-slate-200">{modules.length} Modules</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meetings Tab */}
                {activeTab === 'meetings' && (
                  <div className="space-y-4">
                    {/* Today's Meeting */}
                    {todayMeeting && (
                      <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wide">
                            Today's Live Session
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1">{todayMeeting.title}</h4>
                          <p className="text-xs text-slate-400">
                            {todayMeeting.start_time} - {todayMeeting.end_time} ({todayMeeting.platform})
                          </p>
                        </div>
                        <a
                          href={todayMeeting.meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                        >
                          <VideoIcon className="w-3.5 h-3.5" />
                          <span>Join Meeting</span>
                        </a>
                      </div>
                    )}

                    {/* Upcoming Meetings */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Upcoming Live Sessions
                      </h4>
                      {upcomingMeetings.length === 0 ? (
                        <p className="text-xs text-slate-500 py-3">No upcoming live sessions scheduled yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {upcomingMeetings.map((m) => (
                            <div
                              key={m.id}
                              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                            >
                              <div>
                                <h5 className="text-xs font-bold text-slate-200">{m.title}</h5>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  Date: {m.date} • {m.start_time} - {m.end_time}
                                </p>
                              </div>
                              <a
                                href={m.meeting_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <span>Link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Past Meetings with Recordings */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Past Sessions & Class Recordings
                      </h4>
                      {pastMeetings.length === 0 ? (
                        <p className="text-xs text-slate-500 py-3">No past sessions recorded yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {pastMeetings.map((m) => (
                            <div
                              key={m.id}
                              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                            >
                              <div>
                                <h5 className="text-xs font-bold text-slate-200">{m.title}</h5>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  Held on {m.date}
                                </p>
                              </div>
                              {m.recording_url ? (
                                <a
                                  href={m.recording_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                >
                                  <PlayCircle className="w-3 h-3" />
                                  <span>Watch Recording</span>
                                </a>
                              ) : (
                                <span className="text-[10px] text-slate-500">Recording processing</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Study Materials Tab */}
                {activeTab === 'materials' && (
                  <div className="space-y-3">
                    {materials.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">
                        No study materials uploaded for this course yet.
                      </p>
                    ) : (
                      materials.map((mat) => (
                        <div
                          key={mat.id}
                          className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-200">{mat.title}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">{mat.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-300">
                                  {mat.file_type}
                                </span>
                                {mat.file_size && (
                                  <span className="text-[10px] text-slate-500">{mat.file_size}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <a
                            href={mat.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Download</span>
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Announcements Tab */}
                {activeTab === 'announcements' && (
                  <div className="space-y-3">
                    {announcements.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">
                        No course announcements posted yet.
                      </p>
                    ) : (
                      announcements.map((ann) => (
                        <div
                          key={ann.id}
                          className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-100">{ann.title}</h4>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase">
                              {ann.priority}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{ann.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Course Curriculum & Modules */}
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Course Curriculum</span>
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  {videos.length} Lectures
                </span>
              </div>

              {/* Module Accordions */}
              <div className="space-y-3">
                {modules.map((mod, modIdx) => {
                  const modVideos = videos.filter((v) => v.module_id === mod.id);
                  const isExpanded = expandedModules[mod.id] ?? true;

                  return (
                    <div
                      key={mod.id}
                      className="rounded-2xl border border-slate-800/80 bg-slate-950/60 overflow-hidden"
                    >
                      {/* Module Header */}
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          )}
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">
                              {mod.title}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {modVideos.length} {modVideos.length === 1 ? 'lesson' : 'lessons'}
                            </span>
                          </div>
                        </div>
                      </button>

                      {/* Video List inside module */}
                      {isExpanded && (
                        <div className="border-t border-slate-800/60 divide-y divide-slate-800/40">
                          {modVideos.length === 0 ? (
                            <p className="p-3 text-[11px] text-slate-500 italic">No videos in this module yet.</p>
                          ) : (
                            modVideos.map((vid) => {
                              const isActive = activeVideo?.id === vid.id;
                              const isCompleted = isVideoCompleted(vid.id);

                              return (
                                <div
                                  key={vid.id}
                                  onClick={() => setActiveVideo(vid)}
                                  className={`p-3 flex items-center justify-between text-left cursor-pointer transition-colors ${
                                    isActive
                                      ? 'bg-indigo-600/15 border-l-4 border-indigo-500'
                                      : 'hover:bg-slate-800/30'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 pr-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleComplete(vid);
                                      }}
                                      className="text-slate-500 hover:text-emerald-400"
                                      title={isCompleted ? 'Completed' : 'Mark completed'}
                                    >
                                      {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                                      )}
                                    </button>
                                    <div>
                                      <p
                                        className={`text-xs font-medium leading-snug ${
                                          isActive
                                            ? 'text-indigo-300 font-semibold'
                                            : isCompleted
                                            ? 'text-slate-400 line-through'
                                            : 'text-slate-200'
                                        }`}
                                      >
                                        {vid.title}
                                      </p>
                                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3" />
                                        {vid.duration}
                                      </span>
                                    </div>
                                  </div>

                                  {isActive && (
                                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping shrink-0" />
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Videos not assigned to a module */}
                {videos.filter((v) => !v.module_id).length > 0 && (
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-2">
                    <span className="text-xs font-bold text-slate-300 block">General Lectures</span>
                    <div className="divide-y divide-slate-800/40">
                      {videos
                        .filter((v) => !v.module_id)
                        .map((vid) => (
                          <div
                            key={vid.id}
                            onClick={() => setActiveVideo(vid)}
                            className="py-2 flex items-center justify-between text-left cursor-pointer"
                          >
                            <span className="text-xs text-slate-300">{vid.title}</span>
                            <span className="text-[10px] text-slate-500">{vid.duration}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Support Card */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/20 p-5 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Instructor & Tech Support</span>
              </h4>
              <p className="text-xs text-slate-400">
                Stuck on a bug or need live class assistance? Chat directly with the Pathfinder mentor team.
              </p>
              <a
                href={`https://wa.me/918767168411?text=${encodeURIComponent(`Hello Pathfinder Support, I have a doubt in course "${course.title}".`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <span>Ask on WhatsApp (+91 8767168411)</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Floating WhatsApp Support */}
      <WhatsAppButton customMessage={`Hello Pathfinder Support, I am currently studying "${course.title}".`} />
    </div>
  );
};
