import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Edit, Trash2, Eye, EyeOff, 
  Layers, Clock, ExternalLink, Image as ImageIcon, Sparkles 
} from 'lucide-react';
import { dataRepository } from '../../lib/storage';
import { Course, Module } from '../../types';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';

export const CoursesAdmin: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Course Modal state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    duration: '40 Hours',
    level: 'Beginner to Advanced',
    is_published: true,
  });

  // Module Modal state
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [selectedCourseForModule, setSelectedCourseForModule] = useState<Course | null>(null);
  const [moduleFormData, setModuleFormData] = useState({
    title: '',
    description: '',
    order_index: 1,
  });
  const [courseModules, setCourseModules] = useState<Module[]>([]);

  const { success, error } = useToast();

  const loadCourses = async () => {
    try {
      const data = await dataRepository.getCourses();
      setCourses(data);
    } catch {
      error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();

    const handleDataChange = () => loadCourses();
    window.addEventListener('pf_data_change', handleDataChange);
    return () => window.removeEventListener('pf_data_change', handleDataChange);
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      duration: '45 Hours',
      level: 'Beginner to Advanced',
      is_published: true,
    });
    setIsCourseModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setFormData({
      title: c.title,
      description: c.description,
      image_url: c.image_url,
      duration: c.duration,
      level: c.level,
      is_published: c.is_published,
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await dataRepository.updateCourse(editingCourse.id, formData);
        success(`Course "${formData.title}" updated successfully.`);
      } else {
        await dataRepository.createCourse(formData);
        success(`Course "${formData.title}" created successfully.`);
      }
      setIsCourseModalOpen(false);
      await loadCourses();
    } catch {
      error('Failed to save course.');
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      const updated = await dataRepository.updateCourse(course.id, {
        is_published: !course.is_published,
      });
      if (updated) {
        success(`Course "${course.title}" is now ${updated.is_published ? 'Published' : 'Draft'}`);
        await loadCourses();
      }
    } catch {
      error('Failed to update publication status.');
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    if (window.confirm(`Are you sure you want to delete "${course.title}"? This will also remove enrolled accesses.`)) {
      await dataRepository.deleteCourse(course.id);
      success(`Course "${course.title}" deleted.`);
      await loadCourses();
    }
  };

  // Manage Modules
  const openModulesModal = async (c: Course) => {
    setSelectedCourseForModule(c);
    const mods = await dataRepository.getModules(c.id);
    setCourseModules(mods);
    setModuleFormData({
      title: `Module ${mods.length + 1}: `,
      description: '',
      order_index: mods.length + 1,
    });
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForModule) return;
    try {
      await dataRepository.createModule({
        course_id: selectedCourseForModule.id,
        title: moduleFormData.title,
        description: moduleFormData.description,
        order_index: moduleFormData.order_index,
      });
      success('Module created successfully.');
      const updated = await dataRepository.getModules(selectedCourseForModule.id);
      setCourseModules(updated);
      setModuleFormData({
        title: `Module ${updated.length + 1}: `,
        description: '',
        order_index: updated.length + 1,
      });
    } catch {
      error('Failed to create module.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span>Course Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, edit, organize modules and publish courses.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between"
          >
            {/* Header / Thumbnail */}
            <div className="relative h-44 w-full bg-slate-950">
              <img
                src={course.image_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
              
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    course.is_published
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {course.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">{course.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    {course.duration}
                  </span>
                  <span>Level: {course.level}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModulesModal(course)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Modules</span>
                  </button>
                  <button
                    onClick={() => handleTogglePublish(course)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 transition-colors"
                    title={course.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {course.is_published ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(course)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 transition-colors"
                    title="Edit Course"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 bg-slate-800/60 transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
        subtitle="Manage course title, duration, curriculum overview and thumbnail."
      >
        <form onSubmit={handleSaveCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Course Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Full Stack Web Development"
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a comprehensive course description..."
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 50 Hours"
                className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Level
              </label>
              <input
                type="text"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                placeholder="e.g. Intermediate"
                className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Course Image URL
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_published" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Publish course immediately (Visible to assigned students)
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCourseModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Course Modules Modal */}
      <Modal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        title={`Modules: ${selectedCourseForModule?.title}`}
        subtitle="Create and organize syllabus modules for this course."
      >
        <div className="space-y-5">
          {/* Module List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Existing Modules ({courseModules.length})
            </h4>
            {courseModules.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No modules yet. Add the first module below.</p>
            ) : (
              courseModules.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">{m.title}</h5>
                    {m.description && <p className="text-[11px] text-slate-400">{m.description}</p>}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Order #{m.order_index}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Add Module Form */}
          <form onSubmit={handleSaveModule} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Add New Module
            </h4>
            <div>
              <input
                type="text"
                required
                value={moduleFormData.title}
                onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                placeholder="Module Title (e.g. Module 1: Core Syntax)"
                className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <input
                type="text"
                value={moduleFormData.description}
                onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                placeholder="Short module overview..."
                className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Add Module
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
};
