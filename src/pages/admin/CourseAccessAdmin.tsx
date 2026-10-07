import React, { useState, useEffect } from 'react';
import { 
  KeyRound, UserPlus, CheckCircle2, XCircle, Search, 
  Trash2, ToggleLeft, ToggleRight, Calendar, AlertCircle, RefreshCw 
} from 'lucide-react';
import { dataRepository } from '../../lib/storage';
import { CourseAccess, Course, Profile } from '../../types';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';

export const CourseAccessAdmin: React.FC = () => {
  const [accessList, setAccessList] = useState<CourseAccess[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Grant Access Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentEmail, setSelectedStudentEmail] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const [accs, stds, crss] = await Promise.all([
        dataRepository.getCourseAccess(),
        dataRepository.getStudents(),
        dataRepository.getCourses(),
      ]);
      setAccessList(accs);
      setStudents(stds);
      setCourses(crss);

      if (crss.length > 0 && !selectedCourseId) {
        setSelectedCourseId(crss[0].id);
      }
      if (stds.length > 0 && !selectedStudentEmail) {
        setSelectedStudentEmail(stds[0].email);
      }
    } catch (e) {
      console.error('Error loading course access', e);
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

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = customEmail.trim() || selectedStudentEmail.trim();

    if (!targetEmail) {
      error('Please select or specify a student email.');
      return;
    }
    if (!selectedCourseId) {
      error('Please select a course to grant access.');
      return;
    }

    try {
      await dataRepository.grantCourseAccess(
        targetEmail,
        selectedCourseId,
        notes || 'Granted via Admin Panel',
        expiryDate || undefined
      );

      const targetCourse = courses.find((c) => c.id === selectedCourseId);
      success(`Granted access to "${targetCourse?.title || 'Course'}" for ${targetEmail}`);
      setIsModalOpen(false);
      setCustomEmail('');
      setNotes('');
      setExpiryDate('');
      await loadData();
    } catch (err: any) {
      error(err.message || 'Failed to grant access');
    }
  };

  const handleToggleStatus = async (access: CourseAccess) => {
    try {
      const updated = await dataRepository.toggleCourseAccessStatus(access.id);
      if (updated) {
        success(`Access for ${access.student_email} is now ${updated.is_active ? 'Active' : 'Inactive'}`);
        await loadData();
      }
    } catch {
      error('Failed to toggle status');
    }
  };

  const handleDeleteAccess = async (accessId: string, email: string) => {
    if (window.confirm(`Revoke and remove course access for ${email}?`)) {
      await dataRepository.deleteCourseAccess(accessId);
      success(`Removed course access for ${email}`);
      await loadData();
    }
  };

  const getCourseTitle = (id: string) => {
    return courses.find((c) => c.id === id)?.title || 'Course';
  };

  const filteredAccess = accessList.filter((a) => {
    const term = searchTerm.toLowerCase();
    const courseTitle = getCourseTitle(a.course_id).toLowerCase();
    return a.student_email.toLowerCase().includes(term) || courseTitle.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-indigo-400" />
            <span>Course Access Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Assign courses to student accounts. Students only see courses granted here.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Grant New Course Access</span>
        </button>
      </div>

      {/* Access Flow Diagram / Explainer Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-2 font-medium">
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
            Student Email
          </span>
          <span>→</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
            Selected Course
          </span>
          <span>→</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
            Access Granted
          </span>
        </div>
        <p className="text-slate-400 text-[11px]">
          Example: Assign <strong className="text-slate-200">Software Testing</strong> to{' '}
          <strong className="text-slate-200">pawarvaishnav267@gmail.com</strong> so they can view it.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by student email or course title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <span className="self-center text-xs text-slate-400 whitespace-nowrap">
          {filteredAccess.length} access records
        </span>
      </div>

      {/* Access Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6">Student Email</th>
                <th className="py-4 px-6">Assigned Course</th>
                <th className="py-4 px-6">Granted Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAccess.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No course assignments found matching search.
                  </td>
                </tr>
              ) : (
                filteredAccess.map((access) => (
                  <tr key={access.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-100">{access.student_email}</div>
                      {access.notes && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{access.notes}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-indigo-300">
                        {getCourseTitle(access.course_id)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-xs">
                      {new Date(access.granted_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          access.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {access.is_active ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Revoked</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(access)}
                        className={`p-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          access.is_active
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                        title={access.is_active ? 'Deactivate Access' : 'Activate Access'}
                      >
                        {access.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteAccess(access.id, access.student_email)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
                        title="Delete Access Entry"
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

      {/* Grant Access Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Grant Course Access to Student"
        subtitle="Select the student and choose which course they can access in their dashboard."
      >
        <form onSubmit={handleGrantAccess} className="space-y-4">
          {/* Student Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Registered Student
            </label>
            <select
              value={selectedStudentEmail}
              onChange={(e) => {
                setSelectedStudentEmail(e.target.value);
                setCustomEmail('');
              }}
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {students.map((s) => (
                <option key={s.id} value={s.email}>
                  {s.full_name} ({s.email})
                </option>
              ))}
            </select>
          </div>

          {/* Or Custom Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Or Enter Student Email Manually
            </label>
            <input
              type="email"
              placeholder="e.g. pawarvaishnav267@gmail.com"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Course Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Course to Assign
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.duration})
                </option>
              ))}
            </select>
          </div>

          {/* Expiry Date (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Access Expiry Date (Optional)
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. October Batch Admission"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
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
              Grant Course Access
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
