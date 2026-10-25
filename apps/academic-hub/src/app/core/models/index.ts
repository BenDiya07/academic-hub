export interface Profile {
  id: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: string | null;
  department: string | null;
  bio: string | null;
  location: string | null;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  tags: string[];
  createdAt: string;
  authorName: string;
  authorInitials: string;
  likes: number;
  comments: number;
  liked: boolean;
}

export type ProjectStatus = 'Active' | 'Completed' | 'Planning';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  category: string;
  image: string | null;
  technologies: string[];
  views: number;
  membersCount: number;
  ownerId: string;
  ownerName: string;
  ownerInitials: string;
  isMember: boolean;
  createdAt: string;
}

export interface ProjectDetail extends Project {
  ownerRole: string;
  startDate: string | null;
  endDate: string | null;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string | null;
  members: number;
  joined: boolean;
  initials: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  students: number;
  communities: number;
  projects: number;
  discussions: number;
}
