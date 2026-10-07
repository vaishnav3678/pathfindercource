import React, { useState, useEffect } from 'react';
import { 
  Bell, Plus, Trash2, Eye, EyeOff, AlertTriangle, 
  Sparkles, CheckCircle2 
} from 'lucide-react';
import { dataRepository } from '../../lib/storage';
import { Announcement, Course, AnnouncementPriority } from '../../types';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';

export const AnnouncementsAdmin: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    course_id: '',
    priority: 'normal' as AnnouncementPriority,
    is_published: true,
  });

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const [anns, crss] = await Promise.all([
        dataRepository.getAnnouncements(),
        dataRepository.getCourses(),
      ]);
      setAnnouncements(anns);
      setCourses(crss);
    } catch {
      error('Failed to load announcements');
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

  const openCreateModal = () => {
    setFormData({
      title: '',
      message: '',
      course_id: '',
      priority: 'normal',
      is_published: true,
    });
    setIsModalOpen(true);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dataRepository.createAnnouncement({
        title: formData.title,
        message: formData.message,
        course_id: formData.course_id || undefined,
        priority: formData.priority,
        is_published: formData.is_published,
      });
      success('Announcement broadcasted.');
      setIsModalOpen(false);
      await loadData();
    } catch {
      error('Failed to broadcast announcement.');
    }
  };

  const handleDeleteAnnouncement = async (ann: Announcement) => {
    if (window.confirm(`Delete announcement "${ann.title}"?`)) {
      await dataRepository.deleteAnnouncement(ann.id);
      success('Announcement deleted.');
      await loadData();
    }
  };

  const getCourseTitle = (id?: string) => {
    if (!id) return 'All Enrolled Students';
    return courses.find((c) => c.id === id)?.title || 'Course';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            <span>Course Announcements</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Broadcast notices, meeting schedule updates, exam info, and critical alerts.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
            No active announcements.
          </div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-2xl shrink-0 ${
                    ann.priority === 'urgent'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : ann.priority === 'high'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ann.priority === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300'
                          : ann.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {ann.priority} Priority
                    </span>
                    <span className="text-xs text-indigo-400 font-semibold">
                      Target: {getCourseTitle(ann.course_id)}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      • {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-1.5">{ann.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    {ann.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDeleteAnnouncement(ann)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                title="Delete Announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Post Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast New Announcement"
        subtitle="Display an important notification on student dashboards."
      >
        <form onSubmit={handleSaveAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Announcement Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Schedule Update for Automation Class"
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Audience
              </label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Students (Global)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as AnnouncementPriority })}
                className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent / Alert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Message Content
            </label>
            <textarea
              rows={3}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Write the full announcement message..."
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              Broadcast Now
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
