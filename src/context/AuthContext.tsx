import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types';
import { dataRepository } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isLoading: boolean;
  loginAdmin: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginStudent: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateCurrentUserProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'pf_lms_auth_user_v1';
const ADMIN_CREDENTIALS_KEY = 'pf_lms_admin_credentials_v1';

// Initial admin setup credentials requested by brief
const DEFAULT_ADMIN = {
  username: 'pathfinder3678',
  email: 'admin@pathfinder.edu',
  password: 'Pawar@3678',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize stored session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // If Supabase is connected, check active Supabase auth session
        if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const profile = await dataRepository.getStudentByEmail(data.session.user.email || '');
            if (profile) {
              setUser(profile);
              setIsLoading(false);
              return;
            }
          }
        }

        // Check local persisted session
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          const parsed = JSON.parse(storedUser) as Profile;
          // Refresh from repo in case details or role changed
          const profiles = await dataRepository.getProfiles();
          const fresh = profiles.find((p) => p.email.toLowerCase() === parsed.email.toLowerCase());
          if (fresh) {
            setUser(fresh);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fresh));
          } else {
            setUser(parsed);
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loginAdmin = async (identifier: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const trimmedIdent = identifier.trim().toLowerCase();

      // Check custom updated admin credentials if saved, else default setup credentials
      let storedAdmin = DEFAULT_ADMIN;
      try {
        const customAdminStr = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
        if (customAdminStr) {
          storedAdmin = JSON.parse(customAdminStr);
        }
      } catch {
        storedAdmin = DEFAULT_ADMIN;
      }

      // Check if matches either username or admin email
      const isUsernameMatch = trimmedIdent === storedAdmin.username.toLowerCase();
      const isEmailMatch = trimmedIdent === storedAdmin.email.toLowerCase() || trimmedIdent === 'admin@pathfinder.edu';

      if (!isUsernameMatch && !isEmailMatch) {
        return { success: false, error: 'Invalid admin username or email. Please verify credentials.' };
      }

      if (pass !== storedAdmin.password) {
        return { success: false, error: 'Incorrect administrator password.' };
      }

      // Successful admin login
      const adminProfile: Profile = {
        id: 'p-admin-01',
        email: storedAdmin.email,
        full_name: 'Pathfinder Administrator',
        role: 'admin',
        phone: '+91 8767168411',
        status: 'active',
        created_at: new Date().toISOString(),
      };

      setUser(adminProfile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminProfile));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Admin authentication failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginStudent = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Please enter a valid student email address.' };
      }

      if (!pass || pass.length < 4) {
        return { success: false, error: 'Please provide a valid password.' };
      }

      // 1. Try Supabase Auth if connected
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: pass,
          });
          if (!error && data.user) {
            let profile = await dataRepository.getStudentByEmail(cleanEmail);
            if (!profile) {
              profile = await dataRepository.createStudent({
                email: cleanEmail,
                full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
                status: 'active',
              });
            }
            setUser(profile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
            return { success: true };
          }
        } catch (supaErr) {
          console.warn('Supabase auth sign in error, fallback to profiles store', supaErr);
        }
      }

      // 2. Local student authentication from database profiles
      const student = await dataRepository.getStudentByEmail(cleanEmail);

      if (!student) {
        return {
          success: false,
          error: `No registered student found with email "${cleanEmail}". Please contact Pathfinder administrator to create your student account.`,
        };
      }

      if (student.status !== 'active') {
        return {
          success: false,
          error: 'Your student account is currently inactive. Please contact support or the administrator.',
        };
      }

      // Successful student login
      setUser(student);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(student));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Student login failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign out error', e);
      }
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateCurrentUserProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const updated = await dataRepository.updateStudent(user.id, updates);
    if (updated) {
      setUser(updated);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        isLoading,
        loginAdmin,
        loginStudent,
        logout,
        updateCurrentUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
