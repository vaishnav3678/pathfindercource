import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Trash2, ExternalLink, Download, 
  FileCheck, Link as LinkIcon, BookOpen, Search 
} from 'lucide-react';
import { dataRepository } from '../../lib/storage';
import { StudyMaterial, Course, FileType } from '../../types';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';

export const MaterialsAdmin: React.FC = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    course_id: '',
    description: '',
    file_type: 'PDF' as FileType,
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_size: '2.5 MB',
  });

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const [mats, crss] = await Promise.all([
        dataRepository.getStudyMaterials(),
        dataRepository.getCourses(),
      ]);
      setMaterials(mats);
      setCourses(crss);

      if (crss.length > 0 && !formData.course_id) {
        setFormData((prev) => ({ ...prev, course_id: crss[0].id }));
      }
    } catch {
      error('Failed to load study materials');
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
      course_id: courses[0]?.id || '',
      description: '',
      file_type: 'PDF',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_size: '2.4 MB',
    });
    setIsModalOpen(true);
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.course_id) {
      error('Please select a course.');
      return;
    }

    try {
      await dataRepository.createStudyMaterial(formData);
      success(`Material "${formData.title}" added.`);
      setIsModalOpen(false);
      await loadData();
    } catch {
      error('Failed to add study material.');
    }
  };

  const handleDeleteMaterial = async (mat: StudyMaterial) => {
    if (window.confirm(`Delete study material "${mat.title}"?`)) {
      await dataRepository.deleteStudyMaterial(mat.id);
      success('Material deleted.');
      await loadData();
    }
  };

  const getCourseTitle = (id: string) => {
    return courses.find((c) => c.id === id)?.title || 'Course';
  };

  const filteredMaterials = materials.filter((m) => {
    return selectedCourseFilter === 'all' || m.course_id === selectedCourseFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            <span>Study Materials & Documents</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Provide notes, PDFs, test cheat sheets, code links and assignments to students.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Study Material</span>
        </button>
      </div>

      {/* Course Filter */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-slate-400">Filter by Course:</label>
        <select
          value={selectedCourseFilter}
          onChange={(e) => setSelectedCourseFilter(e.target.value)}
          className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Courses ({materials.length} resources)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
            No study materials uploaded for this course yet.
          </div>
        ) : (
          filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                      {getCourseTitle(mat.course_id)}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{mat.title}</h4>
                    {mat.description && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {mat.description}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteMaterial(mat)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Material"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-300">
                    {mat.file_type}
                  </span>
                  {mat.file_size && <span className="text-[10px]">{mat.file_size}</span>}
                </div>

                <a
                  href={mat.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download / Open</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Material Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Study Material Resource"
        subtitle="Upload or link study guides, PDF documents, or test assignments."
      >
        <form onSubmit={handleSaveMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Resource Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Selenium Locators Quick Reference PDF"
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
                Document Type
              </label>
              <select
                value={formData.file_type}
                onChange={(e) => setFormData({ ...formData, file_type: e.target.value as FileType })}
                className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PDF">PDF Handbook</option>
                <option value="Notes">Lecture Notes</option>
                <option value="Document">Word / Docs Sheet</option>
                <option value="Assignment">Practical Assignment</option>
                <option value="Link">Web / GitHub Link</option>
                <option value="ZIP">ZIP Code Archive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              File URL or Download Link
            </label>
            <input
              type="url"
              required
              value={formData.file_url}
              onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
              placeholder="https://... or cloud storage file link"
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Estimated File Size (e.g. 3.2 MB)
            </label>
            <input
              type="text"
              value={formData.file_size}
              onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
              placeholder="e.g. 2.4 MB"
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Resource Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of the material..."
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
              Add Material
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
