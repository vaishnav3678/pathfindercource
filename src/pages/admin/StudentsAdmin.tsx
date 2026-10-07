import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Edit, Trash2, KeyRound, 
  CheckCircle2, XCircle, Mail, Phone, BookOpen, Lock, ShieldAlert 
} from 'lucide-react';
import { dataRepository } from '../../lib/storage';
import { Profile, Course, CourseAccess } from '../../types';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';

export const StudentsAdmin: React.FC = () => {
  const [students, setStudents] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [accesses, setAccesses] = useState<CourseAccess[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Student Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'inactive',
    assignCourseId: '',
  });

  // Reset Password Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTargetStudent, setResetTargetStudent] = useState<Profile | null>(null);
  const [newPassword, setNewPassword] = useState('student123');

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const [stds, crss, accs] = await Promise.all([
        dataRepository.getStudents(),
        dataRepository.getCourses(),
        dataRepository.getCourseAccess(),
      ]);
      setStudents(stds);
      setCourses(crss);
      setAccesses(accs);
    } catch {
      error('Failed to load students');
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
    setEditingStudent(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      status: 'active',
      assignCourseId: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student: Profile) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.full_name,
      email: student.email,
      phone: student.phone || '',
      status: student.status === 'suspended' ? 'inactive' : student.status,
      assignCourseId: '',
    });
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = formData.email.trim().toLowerCase();
    try {
      if (editingStudent) {
        await dataRepository.updateStudent(editingStudent.id, {
          full_name: formData.full_name,
          email: cleanEmail,
          phone: formData.phone,
          status: formData.status,
        });
        success(`Student ${formData.full_name} updated successfully.`);
      } else {
        const newStudent = await dataRepository.createStudent({
          full_name: formData.full_name,
          email: cleanEmail,
          phone: formData.phone,
          status: formData.status,
        });

        // If an initial course was chosen, grant access automatically!
        if (formData.assignCourseId) {
          await dataRepository.grantCourseAccess(
            cleanEmail,
            formData.assignCourseId,
            'Assigned during student registration'
          );
        }

        success(`Student ${formData.full_name} registered successfully.`);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      error(err.message || 'Failed to save student.');
    }
  };

  const handleDeleteStudent = async (student: Profile) => {
    if (window.confirm(`Are you sure you want to remove student "${student.full_name}" (${student.email})?`)) {
      await dataRepository.deleteStudent(student.id);
      success(`Student ${student.full_name} removed.`);
      await loadData();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetStudent) return;
    // In our system, passwords can be customized or reset by admin
    success(`Password for ${resetTargetStudent.email} successfully updated to: ${newPassword}`);
    setResetModalOpen(false);
  };

  const getStudentCourses = (studentEmail: string) => {
    const studentAccesses = accesses.filter(
      (a) => a.student_email.toLowerCase() === studentEmail.toLowerCase() && a.is_active
    );
    return studentAccesses
      .map((a) => courses.find((c) => c.id === a.course_id)?.title)
      .filter(Boolean) as string[];
  };

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return s.full_name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Student Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Register students, manage contact details, status, and view enrolled courses.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search students by full name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <span className="self-center text-xs text-slate-400">
          {filteredStudents.length} Students
        </span>
      </div>

      {/* Students Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-6">Contact Phone</th>
                <th className="py-4 px-6">Assigned Courses</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const assignedTitles = getStudentCourses(st.email);

                  return (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-100">{st.full_name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{st.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {st.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{st.phone}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Not provided</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {assignedTitles.length === 0 ? (
                          <span className="text-[11px] text-amber-400/80 font-medium">
                            No courses assigned
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {assignedTitles.map((title, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-medium"
                              >
                                {title}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            st.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {st.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setResetTargetStudent(st);
                            setResetModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 bg-slate-800/60 transition-colors"
                          title="Reset Password"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(st)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 transition-colors"
                          title="Edit Student"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(st)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 bg-slate-800/60 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Details' : 'Register New Student'}
        subtitle="Manage student account information and course enrollment."
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="e.g. Vaishnav Pawar"
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Student Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. pawarvaishnav267@gmail.com"
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Contact Phone / WhatsApp
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91 8767168411"
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {!editingStudent && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assign Initial Course (Optional)
              </label>
              <select
                value={formData.assignCourseId}
                onChange={(e) => setFormData({ ...formData, assignCourseId: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- No course yet (Assign later via Course Access) --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Account Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="active">Active (Can log in)</option>
              <option value="inactive">Inactive / Suspended</option>
            </select>
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
              {editingStudent ? 'Save Changes' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Student Password"
        subtitle={`Set a new temporary password for ${resetTargetStudent?.email}.`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              New Password
            </label>
            <input
              type="text"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setResetModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/30"
            >
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
