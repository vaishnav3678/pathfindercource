import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Edit, Trash2, Video, 
  ExternalLink, Clock, PlayCircle, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { dataRepository } from '../../lib/storage';
import { Meeting, Course, MeetingStatus } from '../../types';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';

export const MeetingsAdmin: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    course_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '07:00 PM',
    end_time: '08:30 PM',
    platform: 'Google Meet',
    meeting_url: 'https://meet.google.com/pfc-live-class',
    recording_url: '',
    status: 'scheduled' as MeetingStatus,
  });

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const [meets, crss] = await Promise.all([
        dataRepository.getMeetings(),
        dataRepository.getCourses(),
      ]);
      // Sort in chronological order
      const sorted = [...meets].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMeetings(sorted);
      setCourses(crss);

      if (crss.length > 0 && !formData.course_id) {
        setFormData((prev) => ({ ...prev, course_id: crss[0].id }));
      }
    } catch {
      error('Failed to load meetings');
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
    setEditingMeeting(null);
    setFormData({
      title: "Today's Live Class: ",
      course_id: courses[0]?.id || '',
      description: 'Interactive live session with mentor and hands-on coding.',
      date: new Date().toISOString().split('T')[0],
      start_time: '07:00 PM',
      end_time: '08:30 PM',
      platform: 'Google Meet',
      meeting_url: 'https://meet.google.com/pfc-live-class',
      recording_url: '',
      status: 'scheduled',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (m: Meeting) => {
    setEditingMeeting(m);
    setFormData({
      title: m.title,
      course_id: m.course_id,
      description: m.description || '',
      date: m.date,
      start_time: m.start_time,
      end_time: m.end_time,
      platform: m.platform,
      meeting_url: m.meeting_url,
      recording_url: m.recording_url || '',
      status: m.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.course_id) {
      error('Please select a course for this meeting.');
      return;
    }

    try {
      if (editingMeeting) {
        await dataRepository.updateMeeting(editingMeeting.id, formData);
        success(`Meeting "${formData.title}" updated.`);
      } else {
        await dataRepository.createMeeting(formData);
        success(`Live class "${formData.title}" scheduled.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch {
      error('Failed to save meeting.');
    }
  };

  const handleStatusChange = async (meeting: Meeting, newStatus: MeetingStatus) => {
    try {
      await dataRepository.updateMeeting(meeting.id, { status: newStatus });
      success(`Meeting status changed to ${newStatus}`);
      await loadData();
    } catch {
      error('Failed to update status.');
    }
  };

  const handleDeleteMeeting = async (meeting: Meeting) => {
    if (window.confirm(`Delete meeting "${meeting.title}"?`)) {
      await dataRepository.deleteMeeting(meeting.id);
      success('Meeting deleted.');
      await loadData();
    }
  };

  const getCourseTitle = (id: string) => {
    return courses.find((c) => c.id === id)?.title || 'Course';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-400" />
            <span>Daily Live Meetings Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Schedule today's class, link Google Meet/Zoom, manage recordings and statuses.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Meeting</span>
        </button>
      </div>

      {/* Meetings List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6">Meeting Details</th>
                <th className="py-4 px-6">Associated Course</th>
                <th className="py-4 px-6">Date & Time</th>
                <th className="py-4 px-6">Platform & Link</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {meetings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No scheduled meetings found. Schedule a new one above.
                  </td>
                </tr>
              ) : (
                meetings.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-100">{m.title}</div>
                      {m.description && (
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {m.description}
                        </div>
                      )}
                      {m.recording_url && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-indigo-400 mt-1">
                          <PlayCircle className="w-3 h-3" />
                          <span>Recording Available</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-300">
                        {getCourseTitle(m.course_id)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-200 font-medium">{m.date}</div>
                      <div className="text-[11px] text-slate-400">
                        {m.start_time} - {m.end_time}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <a
                        href={m.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-400 border border-slate-700 transition-colors text-xs font-medium"
                      >
                        <Video className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{m.platform}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={m.status}
                        onChange={(e) => handleStatusChange(m, e.target.value as MeetingStatus)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border bg-slate-950 focus:outline-none ${
                          m.status === 'live'
                            ? 'text-rose-400 border-rose-500/40 bg-rose-950/30'
                            : m.status === 'completed'
                            ? 'text-slate-400 border-slate-700'
                            : 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30'
                        }`}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="live">🔴 Live Now</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(m)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 transition-colors"
                        title="Edit Meeting"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMeeting(m)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 bg-slate-800/60 transition-colors"
                        title="Delete Meeting"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Meeting Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMeeting ? 'Edit Live Class' : 'Schedule New Live Class'}
        subtitle="Set date, timing, platform link, and attach class recording URL."
      >
        <form onSubmit={handleSaveMeeting} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Meeting Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Today's Live Class: Automation Framework"
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Course
              </label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="YouTube Live">YouTube Live</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                placeholder="07:00 PM"
                className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                End Time
              </label>
              <input
                type="text"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                placeholder="08:30 PM"
                className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Live Meeting URL
            </label>
            <input
              type="url"
              required
              value={formData.meeting_url}
              onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
              placeholder="https://meet.google.com/..."
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Class Recording URL (Optional, after session concludes)
            </label>
            <input
              type="url"
              value={formData.recording_url}
              onChange={(e) => setFormData({ ...formData, recording_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=... or Google Drive link"
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Agenda & Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Session agenda..."
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30"
            >
              {editingMeeting ? 'Save Changes' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
