import { 
  Profile, Course, Module, Video, CourseAccess, 
  VideoProgress, Meeting, StudyMaterial, Announcement, AdminDashboardStats 
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  PROFILES: 'pf_lms_profiles_v1',
  COURSES: 'pf_lms_courses_v1',
  MODULES: 'pf_lms_modules_v1',
  VIDEOS: 'pf_lms_videos_v1',
  COURSE_ACCESS: 'pf_lms_course_access_v1',
  VIDEO_PROGRESS: 'pf_lms_video_progress_v1',
  MEETINGS: 'pf_lms_meetings_v1',
  MATERIALS: 'pf_lms_materials_v1',
  ANNOUNCEMENTS: 'pf_lms_announcements_v1',
};

// Initial Seed Data
const INITIAL_COURSES: Course[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    title: 'Software Testing',
    slug: 'software-testing',
    description: 'Master Manual Testing, Automation with Selenium & Cypress, API Testing with Postman, and Test Automation Frameworks from industry experts.',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    duration: '60 Hours',
    level: 'Beginner to Advanced',
    is_published: true,
    created_at: new Date('2026-09-01T10:00:00Z').toISOString(),
  },
  {
    id: 'c2000000-0000-0000-0000-000000000002',
    title: 'Mobile App Development',
    slug: 'mobile-app-development',
    description: 'Build high-performance native and cross-platform apps using React Native, Flutter, and Android Kotlin with hands-on real-world projects.',
    image_url: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=800&q=80',
    duration: '75 Hours',
    level: 'Intermediate to Advanced',
    is_published: true,
    created_at: new Date('2026-09-05T10:00:00Z').toISOString(),
  },
];

const INITIAL_PROFILES: Profile[] = [
  {
    id: 'p-admin-01',
    email: 'admin@pathfinder.edu',
    full_name: 'Pathfinder Administrator',
    role: 'admin',
    phone: '+91 8767168411',
    status: 'active',
    created_at: new Date('2026-08-01T00:00:00Z').toISOString(),
  },
  {
    id: 'p-student-vaishnav',
    email: 'pawarvaishnav267@gmail.com',
    full_name: 'Vaishnav Pawar',
    role: 'student',
    phone: '+91 8767168411',
    status: 'active',
    created_at: new Date('2026-10-01T08:00:00Z').toISOString(),
  },
  {
    id: 'p-student-demo',
    email: 'student@pathfinder.edu',
    full_name: 'Alex Johnson',
    role: 'student',
    phone: '+91 9876543210',
    status: 'active',
    created_at: new Date('2026-10-02T08:00:00Z').toISOString(),
  },
];

// Note: Vaishnav is explicitly assigned ONLY to Software Testing
const INITIAL_COURSE_ACCESS: CourseAccess[] = [
  {
    id: 'ca-001',
    student_id: 'p-student-vaishnav',
    student_email: 'pawarvaishnav267@gmail.com',
    course_id: 'c1000000-0000-0000-0000-000000000001', // Software Testing
    is_active: true,
    granted_at: new Date('2026-10-01T09:00:00Z').toISOString(),
    created_at: new Date('2026-10-01T09:00:00Z').toISOString(),
    notes: 'Enrolled in full stack testing certification',
  },
  {
    id: 'ca-002',
    student_id: 'p-student-demo',
    student_email: 'student@pathfinder.edu',
    course_id: 'c1000000-0000-0000-0000-000000000001', // Software Testing
    is_active: true,
    granted_at: new Date('2026-10-02T09:00:00Z').toISOString(),
    created_at: new Date('2026-10-02T09:00:00Z').toISOString(),
  },
  {
    id: 'ca-003',
    student_id: 'p-student-demo',
    student_email: 'student@pathfinder.edu',
    course_id: 'c2000000-0000-0000-0000-000000000002', // Mobile App Development
    is_active: true,
    granted_at: new Date('2026-10-02T09:00:00Z').toISOString(),
    created_at: new Date('2026-10-02T09:00:00Z').toISOString(),
  },
];

const INITIAL_MODULES: Module[] = [
  // Software Testing Modules
  {
    id: 'mod-st-01',
    course_id: 'c1000000-0000-0000-0000-000000000001',
    title: 'Module 1: Manual Testing & SDLC / STLC Fundamentals',
    description: 'Core testing methodologies, test cases, bug lifecycles, and verification & validation concepts.',
    order_index: 1,
    created_at: new Date('2026-09-01T10:00:00Z').toISOString(),
  },
  {
    id: 'mod-st-02',
    course_id: 'c1000000-0000-0000-0000-000000000001',
    title: 'Module 2: Automation with Selenium WebDriver & Java',
    description: 'Setting up Selenium, locators, page object model (POM), and TestNG framework integration.',
    order_index: 2,
    created_at: new Date('2026-09-01T10:00:00Z').toISOString(),
  },
  {
    id: 'mod-st-03',
    course_id: 'c1000000-0000-0000-0000-000000000001',
    title: 'Module 3: API Testing & Automation with Postman',
    description: 'HTTP methods, status codes, assertion scripts, Newman runner, and CI integration.',
    order_index: 3,
    created_at: new Date('2026-09-01T10:00:00Z').toISOString(),
  },
  // Mobile App Dev Modules
  {
    id: 'mod-mob-01',
    course_id: 'c2000000-0000-0000-0000-000000000002',
    title: 'Module 1: Mobile Architecture & React Native Setup',
    description: 'JSX, mobile components, styles, flexbox layout, and simulator configuration.',
    order_index: 1,
    created_at: new Date('2026-09-05T10:00:00Z').toISOString(),
  },
  {
    id: 'mod-mob-02',
    course_id: 'c2000000-0000-0000-0000-000000000002',
    title: 'Module 2: Navigation, State & Native Device APIs',
    description: 'Stack navigation, tab bars, camera permissions, local storage, and async handlers.',
    order_index: 2,
    created_at: new Date('2026-09-05T10:00:00Z').toISOString(),
  },
];

const INITIAL_VIDEOS: Video[] = [
  // Software Testing Videos
  {
    id: 'vid-st-01',
    course_id: 'c1000000-0000-0000-0000-000000000001',
    module_id: 'mod-st-01',
    title: 'Introduction to Software Testing & Quality Assurance',
    description: 'Overview of manual testing roles, defect management lifecycle, and severity vs priority.',
    video_url: 'https://www.youtube.com/watch?v=sO8eGL6QVUw',
    thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    duration: '22 mins',
    duration_seconds: 1320,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-09-02T10:00:00Z').toISOString(),
  },
  {
    id: 'vid-st-02',
    course_id: 'c1000000-0000-0000-0000-000000000001',
    module_id: 'mod-st-01',
    title: 'Writing Effective Test Cases & Test Scenarios',
    description: 'Step-by-step guide to writing standard industry test cases with boundary value analysis.',
    video_url: 'https://www.youtube.com/watch?v=goaZTAzsLMk',
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    duration: '35 mins',
    duration_seconds: 2100,
    order_index: 2,
    is_published: true,
    created_at: new Date('2026-09-03T10:00:00Z').toISOString(),
  },
  {
    id: 'vid-st-03',
    course_id: 'c1000000-0000-0000-0000-000000000001',
    module_id: 'mod-st-02',
    title: 'Selenium WebDriver Architecture & Setup',
    description: 'Hands-on configuration of Selenium WebDriver with Java and Maven project setup.',
    video_url: 'https://www.youtube.com/watch?v=FRn5J31eGoE',
    thumbnail_url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=600&q=80',
    duration: '42 mins',
    duration_seconds: 2520,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-09-04T10:00:00Z').toISOString(),
  },
  {
    id: 'vid-st-04',
    course_id: 'c1000000-0000-0000-0000-000000000001',
    module_id: 'mod-st-03',
    title: 'API Testing Fundamentals with Postman',
    description: 'Creating requests, environment variables, writing test assertions, and collection runs.',
    video_url: 'https://www.youtube.com/watch?v=VywxIQ2ZXw4',
    thumbnail_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
    duration: '28 mins',
    duration_seconds: 1680,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-09-06T10:00:00Z').toISOString(),
  },

  // Mobile App Dev Videos
  {
    id: 'vid-mob-01',
    course_id: 'c2000000-0000-0000-0000-000000000002',
    module_id: 'mod-mob-01',
    title: 'Introduction to Mobile Development & React Native',
    description: 'Core concepts of mobile architecture, cross-platform vs native, and environment setup.',
    video_url: 'https://www.youtube.com/watch?v=0-S5a0eXPoc',
    thumbnail_url: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=600&q=80',
    duration: '30 mins',
    duration_seconds: 1800,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-09-07T10:00:00Z').toISOString(),
  },
  {
    id: 'vid-mob-02',
    course_id: 'c2000000-0000-0000-0000-000000000002',
    module_id: 'mod-mob-02',
    title: 'Building Interactive Mobile UIs & React Navigation',
    description: 'Styling components, layouts, gestures, and implementing Stack and Tab navigators.',
    video_url: 'https://www.youtube.com/watch?v=bMmDAT7bK88',
    thumbnail_url: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&w=600&q=80',
    duration: '45 mins',
    duration_seconds: 2700,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-09-08T10:00:00Z').toISOString(),
  },
];

const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-01',
    course_id: 'c1000000-0000-0000-0000-000000000001',
    title: "Today's Live Class: Automation Framework Deep Dive",
    description: 'Live interactive coding: Building an end-to-end Data Driven Automation Framework with TestNG.',
    date: new Date().toISOString().split('T')[0], // Today's date!
    start_time: '07:00 PM',
    end_time: '08:30 PM',
    platform: 'Google Meet',
    meeting_url: 'https://meet.google.com/pfc-test-live',
    status: 'scheduled',
    created_at: new Date('2026-10-05T10:00:00Z').toISOString(),
  },
  {
    id: 'meet-02',
    course_id: 'c1000000-0000-0000-0000-000000000001',
    title: 'Upcoming Session: Performance Testing with JMeter',
    description: 'Load testing APIs, analyzing throughput, latency, and generating HTML dashboard reports.',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    start_time: '06:30 PM',
    end_time: '08:00 PM',
    platform: 'Google Meet',
    meeting_url: 'https://meet.google.com/pfc-jmeter-session',
    status: 'scheduled',
    created_at: new Date('2026-10-04T10:00:00Z').toISOString(),
  },
  {
    id: 'meet-03',
    course_id: 'c1000000-0000-0000-0000-000000000001',
    title: 'Past Class: Git & CI/CD Pipelines for QA Engineers',
    description: 'Integrating automated test suites with GitHub Actions and sending execution reports.',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    start_time: '07:00 PM',
    end_time: '08:30 PM',
    platform: 'Google Meet',
    meeting_url: 'https://meet.google.com/pfc-past-git',
    recording_url: 'https://www.youtube.com/watch?v=hwP7mw3g6z4',
    status: 'completed',
    created_at: new Date('2026-10-01T10:00:00Z').toISOString(),
  },
  {
    id: 'meet-04',
    course_id: 'c2000000-0000-0000-0000-000000000002',
    title: 'Live Workshop: Publishing Apps to App Store & Play Store',
    description: 'Code signing, provisioning profiles, store listing assets, and release management.',
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    start_time: '08:00 PM',
    end_time: '09:30 PM',
    platform: 'Google Meet',
    meeting_url: 'https://meet.google.com/pfc-mobile-publish',
    status: 'scheduled',
    created_at: new Date('2026-10-04T10:00:00Z').toISOString(),
  },
];

const INITIAL_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-01',
    course_id: 'c1000000-0000-0000-0000-000000000001',
    module_id: 'mod-st-01',
    title: 'Complete Manual Testing Handbook & Test Case Templates',
    description: 'Production-ready Excel and PDF templates for Test Plan, Test Case Suite, and Bug Tracking.',
    file_type: 'PDF',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_size: '3.8 MB',
    created_at: new Date('2026-09-10T10:00:00Z').toISOString(),
  },
  {
    id: 'mat-02',
    course_id: 'c1000000-0000-0000-0000-000000000001',
    module_id: 'mod-st-02',
    title: 'Selenium WebDriver Cheatsheet & Locators Guide',
    description: 'Quick reference for XPath, CSS selectors, explicit waits, and JavaScript executor.',
    file_type: 'Document',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_size: '1.4 MB',
    created_at: new Date('2026-09-12T10:00:00Z').toISOString(),
  },
  {
    id: 'mat-03',
    course_id: 'c1000000-0000-0000-0000-000000000001',
    module_id: 'mod-st-03',
    title: 'Postman Collection: Sample REST API Test Suite',
    description: 'Importable Postman JSON collection with automated test assertions and auth scripts.',
    file_type: 'Link',
    file_url: 'https://api.postman.com/collections/sample-collection',
    file_size: '420 KB',
    created_at: new Date('2026-09-14T10:00:00Z').toISOString(),
  },
  {
    id: 'mat-04',
    course_id: 'c2000000-0000-0000-0000-000000000002',
    module_id: 'mod-mob-01',
    title: 'React Native Architecture Guide & Component Library',
    description: 'Comprehensive setup guide and cheat sheet for building performant mobile screens.',
    file_type: 'PDF',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_size: '4.2 MB',
    created_at: new Date('2026-09-15T10:00:00Z').toISOString(),
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-01',
    course_id: 'c1000000-0000-0000-0000-000000000001',
    title: "Reminder: Today's Live Class at 7:00 PM!",
    message: 'Join on time for the live Automation Framework session. Keep your IDE and Java ready.',
    priority: 'urgent',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ann-02',
    course_id: undefined, // All courses
    title: 'Welcome to Pathfinder Courses Learning Portal',
    message: 'Welcome students! Check your dashboard for assigned courses, upcoming live meetings, and study materials.',
    priority: 'normal',
    is_published: true,
    created_at: new Date('2026-10-01T12:00:00Z').toISOString(),
  },
];

// Helper to get from storage or fallback
function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('pf_data_change', { detail: { key } }));
  } catch (e) {
    console.error('Storage write error', e);
  }
}

// Initialize seed data if not present
export function initLocalStorage(): void {
  getLocal(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  getLocal(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  getLocal(STORAGE_KEYS.COURSE_ACCESS, INITIAL_COURSE_ACCESS);
  getLocal(STORAGE_KEYS.MODULES, INITIAL_MODULES);
  getLocal(STORAGE_KEYS.VIDEOS, INITIAL_VIDEOS);
  getLocal(STORAGE_KEYS.MEETINGS, INITIAL_MEETINGS);
  getLocal(STORAGE_KEYS.MATERIALS, INITIAL_MATERIALS);
  getLocal(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  getLocal(STORAGE_KEYS.VIDEO_PROGRESS, []);
}

// Run init
initLocalStorage();

// ============================================================
// DATA REPOSITORY API (Supports both Supabase & local storage seamlessly)
// ============================================================

export const dataRepository = {
  // COURSES
  async getCourses(): Promise<Course[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase fetch failed, falling back to local storage', e);
      }
    }
    return getLocal<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  },

  async getCourseById(id: string): Promise<Course | null> {
    const courses = await this.getCourses();
    return courses.find((c) => c.id === id) || null;
  },

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    const newCourse: Course = {
      id: courseData.id || `course-${Date.now()}`,
      title: courseData.title || 'Untitled Course',
      slug: (courseData.title || 'course').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: courseData.description || '',
      image_url: courseData.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      duration: courseData.duration || '40 Hours',
      level: courseData.level || 'Beginner to Advanced',
      is_published: courseData.is_published ?? true,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('courses').insert([newCourse]);
      } catch (e) {
        console.warn('Supabase insert failed', e);
      }
    }

    const current = getLocal<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    setLocal(STORAGE_KEYS.COURSES, [newCourse, ...current]);
    return newCourse;
  },

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('courses').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase update failed', e);
      }
    }

    const current = getLocal<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    const index = current.findIndex((c) => c.id === id);
    if (index === -1) return null;

    current[index] = { ...current[index], ...updates };
    setLocal(STORAGE_KEYS.COURSES, current);
    return current[index];
  },

  async deleteCourse(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('courses').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete failed', e);
      }
    }

    const current = getLocal<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    setLocal(STORAGE_KEYS.COURSES, current.filter((c) => c.id !== id));
    
    // Also cleanup cascaded items
    const accesses = getLocal<CourseAccess[]>(STORAGE_KEYS.COURSE_ACCESS, INITIAL_COURSE_ACCESS);
    setLocal(STORAGE_KEYS.COURSE_ACCESS, accesses.filter((ca) => ca.course_id !== id));
    return true;
  },

  // MODULES
  async getModules(courseId?: string): Promise<Module[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('modules').select('*').order('order_index', { ascending: true });
        if (courseId) query = query.eq('course_id', courseId);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase module fetch failed', e);
      }
    }

    const all = getLocal<Module[]>(STORAGE_KEYS.MODULES, INITIAL_MODULES);
    if (courseId) return all.filter((m) => m.course_id === courseId);
    return all;
  },

  async createModule(moduleData: Partial<Module>): Promise<Module> {
    const newMod: Module = {
      id: moduleData.id || `mod-${Date.now()}`,
      course_id: moduleData.course_id!,
      title: moduleData.title || 'New Module',
      description: moduleData.description || '',
      order_index: moduleData.order_index || 1,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('modules').insert([newMod]);
      } catch (e) {
        console.warn('Supabase create module error', e);
      }
    }

    const list = getLocal<Module[]>(STORAGE_KEYS.MODULES, INITIAL_MODULES);
    setLocal(STORAGE_KEYS.MODULES, [...list, newMod]);
    return newMod;
  },

  // VIDEOS
  async getVideos(courseId?: string): Promise<Video[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('videos').select('*').order('order_index', { ascending: true });
        if (courseId) query = query.eq('course_id', courseId);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase video fetch failed', e);
      }
    }

    const all = getLocal<Video[]>(STORAGE_KEYS.VIDEOS, INITIAL_VIDEOS);
    if (courseId) return all.filter((v) => v.course_id === courseId);
    return all;
  },

  async createVideo(data: Partial<Video>): Promise<Video> {
    const newVid: Video = {
      id: data.id || `vid-${Date.now()}`,
      course_id: data.course_id!,
      module_id: data.module_id,
      title: data.title || 'New Video Lecture',
      description: data.description || '',
      video_url: data.video_url || 'https://www.youtube.com/watch?v=sO8eGL6QVUw',
      thumbnail_url: data.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      duration: data.duration || '20 mins',
      duration_seconds: data.duration_seconds || 1200,
      order_index: data.order_index || 1,
      is_published: data.is_published ?? true,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('videos').insert([newVid]);
      } catch (e) {
        console.warn('Supabase video insert error', e);
      }
    }

    const all = getLocal<Video[]>(STORAGE_KEYS.VIDEOS, INITIAL_VIDEOS);
    setLocal(STORAGE_KEYS.VIDEOS, [...all, newVid]);
    return newVid;
  },

  async updateVideo(id: string, updates: Partial<Video>): Promise<Video | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('videos').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase video update error', e);
      }
    }

    const all = getLocal<Video[]>(STORAGE_KEYS.VIDEOS, INITIAL_VIDEOS);
    const index = all.findIndex((v) => v.id === id);
    if (index === -1) return null;
    all[index] = { ...all[index], ...updates };
    setLocal(STORAGE_KEYS.VIDEOS, all);
    return all[index];
  },

  async deleteVideo(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('videos').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase video delete error', e);
      }
    }

    const all = getLocal<Video[]>(STORAGE_KEYS.VIDEOS, INITIAL_VIDEOS);
    setLocal(STORAGE_KEYS.VIDEOS, all.filter((v) => v.id !== id));
    return true;
  },

  // STUDENTS & PROFILES
  async getProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase profiles fetch error', e);
      }
    }
    return getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  },

  async getStudents(): Promise<Profile[]> {
    const profiles = await this.getProfiles();
    return profiles.filter((p) => p.role === 'student');
  },

  async getStudentByEmail(email: string): Promise<Profile | null> {
    const profiles = await this.getProfiles();
    const cleanEmail = email.trim().toLowerCase();
    return profiles.find((p) => p.email.toLowerCase() === cleanEmail) || null;
  },

  async createStudent(data: Partial<Profile>): Promise<Profile> {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const newStudent: Profile = {
      id: data.id || `p-student-${Date.now()}`,
      email: cleanEmail,
      full_name: data.full_name || 'New Student',
      role: 'student',
      phone: data.phone || '',
      status: data.status || 'active',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('profiles').insert([newStudent]);
      } catch (e) {
        console.warn('Supabase student insert error', e);
      }
    }

    const all = getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    setLocal(STORAGE_KEYS.PROFILES, [...all, newStudent]);
    return newStudent;
  },

  async updateStudent(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('profiles').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase student update error', e);
      }
    }

    const all = getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const index = all.findIndex((p) => p.id === id);
    if (index === -1) return null;
    all[index] = { ...all[index], ...updates };
    setLocal(STORAGE_KEYS.PROFILES, all);
    return all[index];
  },

  async deleteStudent(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('profiles').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase student delete error', e);
      }
    }

    const all = getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const student = all.find((p) => p.id === id);
    setLocal(STORAGE_KEYS.PROFILES, all.filter((p) => p.id !== id));
    
    if (student) {
      const accesses = getLocal<CourseAccess[]>(STORAGE_KEYS.COURSE_ACCESS, INITIAL_COURSE_ACCESS);
      setLocal(
        STORAGE_KEYS.COURSE_ACCESS, 
        accesses.filter((ca) => ca.student_email.toLowerCase() !== student.email.toLowerCase() && ca.student_id !== id)
      );
    }
    return true;
  },

  // COURSE ACCESS MANAGEMENT (Strict Assignment)
  async getCourseAccess(): Promise<CourseAccess[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('course_access').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase course_access fetch error', e);
      }
    }
    return getLocal<CourseAccess[]>(STORAGE_KEYS.COURSE_ACCESS, INITIAL_COURSE_ACCESS);
  },

  async getStudentAssignedCourses(studentEmail: string): Promise<Course[]> {
    const cleanEmail = studentEmail.trim().toLowerCase();
    const allAccess = await this.getCourseAccess();
    const activeAccesses = allAccess.filter(
      (ca) => ca.student_email.toLowerCase() === cleanEmail && ca.is_active
    );

    const allCourses = await this.getCourses();
    const assignedCourseIds = new Set(activeAccesses.map((ca) => ca.course_id));

    // Filter courses strictly assigned to this student
    const assignedCourses = allCourses.filter((c) => assignedCourseIds.has(c.id) && c.is_published);
    
    // Attach statistics (videos count, meetings count, progress)
    const videos = await this.getVideos();
    const meetings = await this.getMeetings();
    const progressList = getLocal<VideoProgress[]>(STORAGE_KEYS.VIDEO_PROGRESS, []);

    return assignedCourses.map((c) => {
      const courseVideos = videos.filter((v) => v.course_id === c.id && v.is_published);
      const courseMeetings = meetings.filter((m) => m.course_id === c.id);
      
      const completedCount = courseVideos.filter((v) => 
        progressList.some((p) => p.video_id === v.id && p.is_completed)
      ).length;

      const progress = courseVideos.length > 0 ? Math.round((completedCount / courseVideos.length) * 100) : 0;

      return {
        ...c,
        videos_count: courseVideos.length,
        meetings_count: courseMeetings.length,
        progress_percentage: progress,
      };
    });
  },

  async grantCourseAccess(studentEmail: string, courseId: string, notes?: string, expiresAt?: string): Promise<CourseAccess> {
    const cleanEmail = studentEmail.trim().toLowerCase();
    const all = await this.getCourseAccess();
    
    // Check if access entry exists
    const existingIndex = all.findIndex(
      (ca) => ca.student_email.toLowerCase() === cleanEmail && ca.course_id === courseId
    );

    if (existingIndex !== -1) {
      all[existingIndex].is_active = true;
      if (expiresAt) all[existingIndex].expires_at = expiresAt;
      if (notes) all[existingIndex].notes = notes;
      all[existingIndex].granted_at = new Date().toISOString();

      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from('course_access').update({
            is_active: true,
            expires_at: expiresAt,
            notes,
            granted_at: all[existingIndex].granted_at,
          }).eq('id', all[existingIndex].id);
        } catch (e) {
          console.warn('Supabase update course_access error', e);
        }
      }

      setLocal(STORAGE_KEYS.COURSE_ACCESS, all);
      return all[existingIndex];
    }

    // Lookup student profile ID if exists
    const students = await this.getStudents();
    const matchedStudent = students.find((s) => s.email.toLowerCase() === cleanEmail);

    const newAccess: CourseAccess = {
      id: `ca-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      student_id: matchedStudent?.id,
      student_email: cleanEmail,
      course_id: courseId,
      is_active: true,
      granted_at: new Date().toISOString(),
      expires_at: expiresAt,
      notes: notes || 'Access granted by Admin',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('course_access').insert([newAccess]);
      } catch (e) {
        console.warn('Supabase insert course_access error', e);
      }
    }

    setLocal(STORAGE_KEYS.COURSE_ACCESS, [newAccess, ...all]);
    return newAccess;
  },

  async revokeCourseAccess(accessId: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('course_access').update({ is_active: false }).eq('id', accessId);
      } catch (e) {
        console.warn('Supabase revoke course_access error', e);
      }
    }

    const all = getLocal<CourseAccess[]>(STORAGE_KEYS.COURSE_ACCESS, INITIAL_COURSE_ACCESS);
    const index = all.findIndex((ca) => ca.id === accessId);
    if (index !== -1) {
      all[index].is_active = false;
      setLocal(STORAGE_KEYS.COURSE_ACCESS, all);
      return true;
    }
    return false;
  },

  async deleteCourseAccess(accessId: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('course_access').delete().eq('id', accessId);
      } catch (e) {
        console.warn('Supabase delete course_access error', e);
      }
    }

    const all = getLocal<CourseAccess[]>(STORAGE_KEYS.COURSE_ACCESS, INITIAL_COURSE_ACCESS);
    setLocal(STORAGE_KEYS.COURSE_ACCESS, all.filter((ca) => ca.id !== accessId));
    return true;
  },

  async toggleCourseAccessStatus(accessId: string): Promise<CourseAccess | null> {
    const all = getLocal<CourseAccess[]>(STORAGE_KEYS.COURSE_ACCESS, INITIAL_COURSE_ACCESS);
    const index = all.findIndex((ca) => ca.id === accessId);
    if (index === -1) return null;

    all[index].is_active = !all[index].is_active;

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('course_access').update({ is_active: all[index].is_active }).eq('id', accessId);
      } catch (e) {
        console.warn('Supabase toggle course_access error', e);
      }
    }

    setLocal(STORAGE_KEYS.COURSE_ACCESS, all);
    return all[index];
  },

  // MEETINGS
  async getMeetings(courseId?: string): Promise<Meeting[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('meetings').select('*').order('date', { ascending: false });
        if (courseId) query = query.eq('course_id', courseId);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase meetings fetch error', e);
      }
    }

    const all = getLocal<Meeting[]>(STORAGE_KEYS.MEETINGS, INITIAL_MEETINGS);
    if (courseId) return all.filter((m) => m.course_id === courseId);
    return all;
  },

  async createMeeting(data: Partial<Meeting>): Promise<Meeting> {
    const newMeet: Meeting = {
      id: data.id || `meet-${Date.now()}`,
      course_id: data.course_id!,
      title: data.title || 'Live Interactive Class',
      description: data.description || '',
      date: data.date || new Date().toISOString().split('T')[0],
      start_time: data.start_time || '07:00 PM',
      end_time: data.end_time || '08:30 PM',
      platform: data.platform || 'Google Meet',
      meeting_url: data.meeting_url || 'https://meet.google.com/pfc-live-class',
      recording_url: data.recording_url || '',
      status: data.status || 'scheduled',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('meetings').insert([newMeet]);
      } catch (e) {
        console.warn('Supabase meeting insert error', e);
      }
    }

    const all = getLocal<Meeting[]>(STORAGE_KEYS.MEETINGS, INITIAL_MEETINGS);
    setLocal(STORAGE_KEYS.MEETINGS, [newMeet, ...all]);
    return newMeet;
  },

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('meetings').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase meeting update error', e);
      }
    }

    const all = getLocal<Meeting[]>(STORAGE_KEYS.MEETINGS, INITIAL_MEETINGS);
    const index = all.findIndex((m) => m.id === id);
    if (index === -1) return null;
    all[index] = { ...all[index], ...updates };
    setLocal(STORAGE_KEYS.MEETINGS, all);
    return all[index];
  },

  async deleteMeeting(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('meetings').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase meeting delete error', e);
      }
    }

    const all = getLocal<Meeting[]>(STORAGE_KEYS.MEETINGS, INITIAL_MEETINGS);
    setLocal(STORAGE_KEYS.MEETINGS, all.filter((m) => m.id !== id));
    return true;
  },

  // STUDY MATERIALS
  async getStudyMaterials(courseId?: string): Promise<StudyMaterial[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('study_materials').select('*').order('created_at', { ascending: false });
        if (courseId) query = query.eq('course_id', courseId);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase study_materials fetch error', e);
      }
    }

    const all = getLocal<StudyMaterial[]>(STORAGE_KEYS.MATERIALS, INITIAL_MATERIALS);
    if (courseId) return all.filter((m) => m.course_id === courseId);
    return all;
  },

  async createStudyMaterial(data: Partial<StudyMaterial>): Promise<StudyMaterial> {
    const newMat: StudyMaterial = {
      id: data.id || `mat-${Date.now()}`,
      course_id: data.course_id!,
      module_id: data.module_id,
      title: data.title || 'Study Material Resource',
      description: data.description || '',
      file_type: data.file_type || 'PDF',
      file_url: data.file_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_size: data.file_size || '2.5 MB',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('study_materials').insert([newMat]);
      } catch (e) {
        console.warn('Supabase study_material insert error', e);
      }
    }

    const all = getLocal<StudyMaterial[]>(STORAGE_KEYS.MATERIALS, INITIAL_MATERIALS);
    setLocal(STORAGE_KEYS.MATERIALS, [newMat, ...all]);
    return newMat;
  },

  async deleteStudyMaterial(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('study_materials').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase material delete error', e);
      }
    }

    const all = getLocal<StudyMaterial[]>(STORAGE_KEYS.MATERIALS, INITIAL_MATERIALS);
    setLocal(STORAGE_KEYS.MATERIALS, all.filter((m) => m.id !== id));
    return true;
  },

  // ANNOUNCEMENTS
  async getAnnouncements(courseId?: string): Promise<Announcement[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('announcements').select('*').order('created_at', { ascending: false });
        if (courseId) query = query.or(`course_id.eq.${courseId},course_id.is.null`);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase announcements fetch error', e);
      }
    }

    const all = getLocal<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    if (courseId) {
      return all.filter((a) => !a.course_id || a.course_id === courseId);
    }
    return all;
  },

  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    const newAnn: Announcement = {
      id: data.id || `ann-${Date.now()}`,
      course_id: data.course_id,
      title: data.title || 'Course Announcement',
      message: data.message || '',
      priority: data.priority || 'normal',
      is_published: data.is_published ?? true,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('announcements').insert([newAnn]);
      } catch (e) {
        console.warn('Supabase announcement insert error', e);
      }
    }

    const all = getLocal<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    setLocal(STORAGE_KEYS.ANNOUNCEMENTS, [newAnn, ...all]);
    return newAnn;
  },

  async deleteAnnouncement(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('announcements').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase announcement delete error', e);
      }
    }

    const all = getLocal<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    setLocal(STORAGE_KEYS.ANNOUNCEMENTS, all.filter((a) => a.id !== id));
    return true;
  },

  // VIDEO PROGRESS TRACKING
  async getVideoProgress(studentId: string, courseId: string): Promise<VideoProgress[]> {
    const all = getLocal<VideoProgress[]>(STORAGE_KEYS.VIDEO_PROGRESS, []);
    return all.filter((p) => p.student_id === studentId && p.course_id === courseId);
  },

  async toggleVideoProgress(studentId: string, videoId: string, courseId: string): Promise<boolean> {
    const all = getLocal<VideoProgress[]>(STORAGE_KEYS.VIDEO_PROGRESS, []);
    const index = all.findIndex((p) => p.student_id === studentId && p.video_id === videoId);

    let isCompleted = true;
    if (index !== -1) {
      isCompleted = !all[index].is_completed;
      all[index].is_completed = isCompleted;
      all[index].last_watched_at = new Date().toISOString();
    } else {
      all.push({
        id: `prog-${Date.now()}`,
        student_id: studentId,
        video_id: videoId,
        course_id: courseId,
        is_completed: true,
        watched_seconds: 600,
        last_watched_at: new Date().toISOString(),
      });
      isCompleted = true;
    }

    setLocal(STORAGE_KEYS.VIDEO_PROGRESS, all);
    return isCompleted;
  },

  // ADMIN DASHBOARD STATS
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const students = await this.getStudents();
    const courses = await this.getCourses();
    const videos = await this.getVideos();
    const meetings = await this.getMeetings();
    const accesses = await this.getCourseAccess();

    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingMeetings = meetings.filter((m) => m.date >= todayStr && m.status !== 'cancelled').length;
    const activeStudents = students.filter((s) => s.status === 'active').length;
    const activeEnrollments = accesses.filter((a) => a.is_active).length;

    return {
      totalStudents: students.length,
      totalCourses: courses.length,
      activeStudents,
      totalVideos: videos.length,
      upcomingMeetings,
      totalEnrollments: activeEnrollments,
    };
  },

  // Reset to initial seed state
  resetToSeeds(): void {
    setLocal(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    setLocal(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    setLocal(STORAGE_KEYS.COURSE_ACCESS, INITIAL_COURSE_ACCESS);
    setLocal(STORAGE_KEYS.MODULES, INITIAL_MODULES);
    setLocal(STORAGE_KEYS.VIDEOS, INITIAL_VIDEOS);
    setLocal(STORAGE_KEYS.MEETINGS, INITIAL_MEETINGS);
    setLocal(STORAGE_KEYS.MATERIALS, INITIAL_MATERIALS);
    setLocal(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    setLocal(STORAGE_KEYS.VIDEO_PROGRESS, []);
  },
};
