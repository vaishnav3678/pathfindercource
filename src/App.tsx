/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { Login } from './pages/Login';
import { StudentDashboard } from './pages/student/Dashboard';
import { CourseDetail } from './pages/student/CourseDetail';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CoursesAdmin } from './pages/admin/CoursesAdmin';
import { StudentsAdmin } from './pages/admin/StudentsAdmin';
import { CourseAccessAdmin } from './pages/admin/CourseAccessAdmin';
import { VideosAdmin } from './pages/admin/VideosAdmin';
import { MeetingsAdmin } from './pages/admin/MeetingsAdmin';
import { MaterialsAdmin } from './pages/admin/MaterialsAdmin';
import { AnnouncementsAdmin } from './pages/admin/AnnouncementsAdmin';
import { SettingsAdmin } from './pages/admin/SettingsAdmin';

// Route Guards
const ProtectedStudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // If student tries to access admin panel, redirect to student dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Root index redirector
const RootRedirect: React.FC = () => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Root Route */}
            <Route path="/" element={<RootRedirect />} />

            {/* Auth / Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Student Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedStudentRoute>
                  <StudentDashboard />
                </ProtectedStudentRoute>
              }
            />
            <Route
              path="/course/:courseId"
              element={
                <ProtectedStudentRoute>
                  <CourseDetail />
                </ProtectedStudentRoute>
              }
            />

            {/* Admin Protected Routes with Nested Layout */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="courses" element={<CoursesAdmin />} />
              <Route path="students" element={<StudentsAdmin />} />
              <Route path="access" element={<CourseAccessAdmin />} />
              <Route path="videos" element={<VideosAdmin />} />
              <Route path="meetings" element={<MeetingsAdmin />} />
              <Route path="materials" element={<MaterialsAdmin />} />
              <Route path="announcements" element={<AnnouncementsAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
            </Route>

            {/* Fallback to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
