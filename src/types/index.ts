export type UserRole = 'admin' | 'student';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  status: UserStatus;
  avatar_url?: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  duration: string;
  level: string;
  is_published: boolean;
  created_at: string;
  // Computed / aggregated attributes for cards
  videos_count?: number;
  meetings_count?: number;
  modules_count?: number;
  progress_percentage?: number;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
}

export interface Video {
  id: string;
  course_id: string;
  module_id?: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration: string;
  duration_seconds?: number;
  order_index: number;
  is_published: boolean;
  created_at: string;
  is_completed?: boolean;
}

export interface CourseAccess {
  id: string;
  student_id?: string;
  student_email: string;
  course_id: string;
  is_active: boolean;
  granted_at: string;
  expires_at?: string;
  notes?: string;
  created_at: string;
  // Denormalized joins
  student_name?: string;
  course_title?: string;
}

export interface VideoProgress {
  id: string;
  student_id: string;
  video_id: string;
  course_id: string;
  is_completed: boolean;
  watched_seconds: number;
  last_watched_at: string;
}

export type MeetingStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface Meeting {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  start_time: string; // e.g. "07:00 PM"
  end_time: string; // e.g. "08:30 PM"
  platform: string; // "Google Meet", "Zoom", "Microsoft Teams"
  meeting_url: string;
  recording_url?: string;
  status: MeetingStatus;
  created_at: string;
  course_title?: string;
}

export type FileType = 'PDF' | 'Notes' | 'Document' | 'Link' | 'Assignment' | 'ZIP';

export interface StudyMaterial {
  id: string;
  course_id: string;
  module_id?: string;
  title: string;
  description?: string;
  file_type: FileType;
  file_url: string;
  file_size?: string;
  created_at: string;
  course_title?: string;
}

export type AnnouncementPriority = 'normal' | 'high' | 'urgent';

export interface Announcement {
  id: string;
  course_id?: string; // null means for all students
  title: string;
  message: string;
  priority: AnnouncementPriority;
  is_published: boolean;
  created_at: string;
  course_title?: string;
}

export interface AdminDashboardStats {
  totalStudents: number;
  totalCourses: number;
  activeStudents: number;
  totalVideos: number;
  upcomingMeetings: number;
  totalEnrollments: number;
}
