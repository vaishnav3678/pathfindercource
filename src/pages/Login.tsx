import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ShieldCheck, GraduationCap, Lock, Mail, User, ArrowRight, AlertCircle, Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { WhatsAppButton } from '../components/common/WhatsAppButton';

export const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginAdmin, loginStudent } = useAuth();
  const navigate = useNavigate();

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const result = await loginStudent(studentEmail, studentPassword);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const result = await loginAdmin(adminIdentifier, adminPassword);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/admin');
    } else {
      setErrorMsg(result.error || 'Invalid admin credentials.');
    }
  };

  // Quick fill buttons for testing/evaluation
  const fillStudentCredentials = (email: string) => {
    setStudentEmail(email);
    setStudentPassword('student123');
    setErrorMsg('');
  };

  const fillAdminCredentials = () => {
    setAdminIdentifier('pathfinder3678');
    setAdminPassword('Pawar@3678');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white shadow-xl shadow-indigo-600/30 mb-4 transform hover:scale-105 transition-transform">
            <Compass className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            PATHFINDER <span className="text-indigo-400">COURSES</span>
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-400">
            Learn. Practice. Grow.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/90 border border-slate-800 shadow-2xl shadow-black/60 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
          {/* Dual Tabs: Student vs Admin */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-slate-800 text-indigo-300 shadow-inner border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Login</span>
            </button>
          </div>

          {/* Error Message banner */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs sm:text-sm animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Student Login Form */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Student Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="e.g. pawarvaishnav267@gmail.com"
                    className="block w-full pl-10 pr-3.5 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Use the email address registered by the course administrator.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Enter password"
                    className="block w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Student Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Account Quick Pickers */}
              <div className="mt-6 pt-5 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                  Quick Demo Access:
                </span>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fillStudentCredentials('pawarvaishnav267@gmail.com')}
                    className="text-left p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                        Vaishnav Pawar
                      </p>
                      <p className="text-[11px] text-slate-400">pawarvaishnav267@gmail.com</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Assigned: Software Testing
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillStudentCredentials('student@pathfinder.edu')}
                    className="text-left p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                        Demo Student (Alex)
                      </p>
                      <p className="text-[11px] text-slate-400">student@pathfinder.edu</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                      Assigned: Both Courses
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Admin Login Form */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Admin Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={adminIdentifier}
                    onChange={(e) => setAdminIdentifier(e.target.value)}
                    placeholder="Username: pathfinder3678"
                    className="block w-full pl-10 pr-3.5 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Administrator Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="block w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Access Admin Dashboard</span>
                  </>
                )}
              </button>

              {/* Demo Admin Auto-fill button */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="w-full p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Auto-fill Initial Admin Credentials</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Support Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Need urgent assistance? Contact Pathfinder Support at{' '}
            <a
              href="https://wa.me/918767168411?text=Hello%20Pathfinder%20Support%2C%20I%20need%20help%20regarding%20my%20course%2Faccount."
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 font-semibold hover:underline"
            >
              +91 8767168411
            </a>
          </p>
        </div>
      </div>

      {/* Floating WhatsApp Support Button */}
      <WhatsAppButton />
    </div>
  );
};
