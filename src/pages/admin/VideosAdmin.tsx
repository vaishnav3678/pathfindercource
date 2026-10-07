import React, { useState, useEffect } from 'react';
import { 
  Video as VideoIcon, Plus, Edit, Trash2, Eye, EyeOff, 
  Clock, Play, ExternalLink, Search, Filter 
} from 'lucide-react';
import { dataRepository } from '../../lib/storage';
import { Video, Course, Module } from '../../types';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';

export const VideosAdmin: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    course_id: '',
    module_id: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: '25 mins',
    order_index: 1,
    is_published: true,
  });

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const [vids, crss, mods] = await Promise.all([
        dataRepository.getVideos(),
        dataRepository.getCourses(),
        dataRepository.getModules(),
      ]);
      setVideos(vids);
      setCourses(crss);
      setModules(mods);

      if (crss.length > 0 && !formData.course_id) {
        setFormData((prev) => ({ ...prev, course_id: crss[0].id }));
      }
    } catch {
      error('Failed to load videos');
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
    setEditingVideo(null);
    const initialCourseId = selectedCourseFilter !== 'all' ? selectedCourseFilter : courses[0]?.id || '';
    const courseMods = modules.filter((m) => m.course_id === initialCourseId);
    
    setFormData({
      title: '',
      course_id: initialCourseId,
      module_id: courseMods[0]?.id || '',
      description: '',
      video_url: 'https://www.youtube.com/watch?v=sO8eGL6QVUw',
      thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      duration: '25 mins',
      order_index: videos.length + 1,
      is_published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (v: Video) => {
    setEditingVideo(v);
    setFormData({
      title: v.title,
      course_id: v.course_id,
      module_id: v.module_id || '',
      description: v.description || '',
      video_url: v.video_url,
      thumbnail_url: v.thumbnail_url || '',
      duration: v.duration,
      order_index: v.order_index,
      is_published: v.is_published,
    });
    setIsModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.course_id) {
      error('Please select a course for this video.');
      return;
    }

    try {
      if (editingVideo) {
        await dataRepository.updateVideo(editingVideo.id, formData);
        success(`Video "${formData.title}" updated.`);
      } else {
        await dataRepository.createVideo(formData);
        success(`Video "${formData.title}" added to course.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch {
      error('Failed to save video.');
    }
  };

  const handleTogglePublish = async (video: Video) => {
    try {
      const updated = await dataRepository.updateVideo(video.id, {
        is_published: !video.is_published,
      });
      if (updated) {
        success(`Video status set to ${updated.is_published ? 'Published' : 'Unpublished'}`);
        await loadData();
      }
    } catch {
      error('Failed to update video status.');
    }
  };

  const handleDeleteVideo = async (video: Video) => {
    if (window.confirm(`Delete video lecture "${video.title}"?`)) {
      await dataRepository.deleteVideo(video.id);
      success(`Video deleted.`);
      await loadData();
    }
  };

  const getCourseTitle = (id: string) => {
    return courses.find((c) => c.id === id)?.title || 'Course';
  };

  const getModuleName = (id?: string) => {
    if (!id) return 'General Lecture';
    return modules.find((m) => m.id === id)?.title || 'General Lecture';
  };

  const filteredVideos = videos.filter((v) => {
    const matchCourse = selectedCourseFilter === 'all' || v.course_id === selectedCourseFilter;
    const matchSearch =
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCourseTitle(v.course_id).toLowerCase().includes(searchTerm.toLowerCase());
    return matchCourse && matchSearch;
  });

  const availableModulesForForm = modules.filter((m) => m.course_id === formData.course_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <VideoIcon className="w-6 h-6 text-indigo-400" />
            <span>Video Lectures Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Add dynamic lectures, YouTube / cloud video URLs, and assign to modules.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Video</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by video title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Courses ({videos.length} videos)</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Videos List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVideos.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/50 rounded-3xl border border-slate-800">
            No video lectures found matching criteria.
          </div>
        ) : (
          filteredVideos.map((vid) => (
            <div
              key={vid.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between"
            >
              {/* Thumbnail preview */}
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                <img
                  src={vid.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'}
                  alt={vid.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <a
                    href={vid.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-indigo-600 rounded-full text-white shadow-xl hover:scale-110 transition-transform"
                    title="Preview Video"
                  >
                    <Play className="w-5 h-5 fill-current" />
                  </a>
                </div>

                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/80 text-white flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  {vid.duration}
                </span>

                <span
                  className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    vid.is_published
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {vid.is_published ? 'Published' : 'Draft'}
                </span>
              </div>

              {/* Info & Meta */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                    {getCourseTitle(vid.course_id)}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5 line-clamp-1">
                    {vid.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    Module: {getModuleName(vid.module_id)}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Order #{vid.order_index}</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTogglePublish(vid)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 transition-colors"
                      title={vid.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {vid.is_published ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => openEditModal(vid)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 transition-colors"
                      title="Edit Video"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(vid)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 bg-slate-800/60 transition-colors"
                      title="Delete Video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Video Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVideo ? 'Edit Video Lecture' : 'Add New Video Lecture'}
        subtitle="Specify video title, streaming URL (YouTube/MP4), module and duration."
      >
        <form onSubmit={handleSaveVideo} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Video Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Introduction to Test Automation"
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
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value, module_id: '' })}
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
                Module (Optional)
              </label>
              <select
                value={formData.module_id}
                onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- General Lecture --</option>
                {availableModulesForForm.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Video URL (YouTube or Direct Video Stream)
            </label>
            <input
              type="url"
              required
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duration (Display)
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 35 mins"
                className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
                className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Thumbnail URL (Optional)
            </label>
            <input
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lesson Description / Key Takeaways
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What students learn in this video..."
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="vid_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="vid_published" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Publish immediately
            </label>
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
              {editingVideo ? 'Save Changes' : 'Add Video'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
