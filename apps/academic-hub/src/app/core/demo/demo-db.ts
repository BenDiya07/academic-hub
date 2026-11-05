import type {
  ChatMessage,
  ChatUser,
  Community,
  DashboardStats,
  Post,
  PostComment,
  Profile,
  Project,
  ProjectDetail,
  ProjectStatus,
} from '../models';
import { initials } from '../utils/format';

const STORAGE_KEY = 'academic-hub:demo-db';
const STORE_VERSION = 1;

export interface DemoAccount {
  id: string;
  email: string;
  name: string;
}

interface DemoProfileRow {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  department: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
}

interface DemoPostRow {
  id: string;
  author_id: string;
  content: string;
  tags: string[];
  likes: number;
  created_at: string;
}

interface DemoCommentRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

interface DemoProjectRow {
  id: string;
  title: string;
  description: string;
  owner_id: string;
  status: ProjectStatus;
  progress: number;
  category: string;
  image_url: string | null;
  technologies: string[];
  views: number;
  member_count: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

interface DemoCommunityRow {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string | null;
  member_count: number;
  created_by: string | null;
  created_at: string;
}

interface DemoMessageRow {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface DemoStore {
  version: number;
  accounts: DemoAccount[];
  profiles: DemoProfileRow[];
  posts: DemoPostRow[];
  comments: DemoCommentRow[];
  projects: DemoProjectRow[];
  communities: DemoCommunityRow[];
  messages: DemoMessageRow[];
  joinedProjects: Record<string, string[]>;
  joinedCommunities: Record<string, string[]>;
  likedPosts: Record<string, string[]>;
}

export interface CreateCommunityInput {
  name: string;
  description: string;
  category: string;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  technologies: string[];
}

export interface UpdateProfileInput {
  username: string | null;
  fullName: string | null;
  role: string | null;
  department: string | null;
  bio: string | null;
  location: string | null;
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function uid(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}${Date.now().toString(36)}`;
}

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'member';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function createSeedStore(): DemoStore {
  const profiles: DemoProfileRow[] = [
    {
      id: 'u-demo',
      email: 'demo@academic-hub.app',
      username: 'alexmorgan',
      full_name: 'Alex Morgan',
      avatar_url: null,
      role: 'Computer Science Student',
      department: 'Computer Science',
      bio: 'Passionate about web development, AI and building tools that help students learn faster.',
      location: 'London, UK',
      created_at: daysAgo(420),
    },
    {
      id: 'u-sofia',
      email: 'sofia.reyes@academic-hub.app',
      username: 'sofia',
      full_name: 'Sofia Reyes',
      avatar_url: null,
      role: 'AI Researcher',
      department: 'Artificial Intelligence',
      bio: 'Researching machine learning for education.',
      location: 'Madrid, Spain',
      created_at: daysAgo(610),
    },
    {
      id: 'u-daniel',
      email: 'daniel.chen@academic-hub.app',
      username: 'daniel',
      full_name: 'Daniel Chen',
      avatar_url: null,
      role: 'Full-stack Developer',
      department: 'Software Engineering',
      bio: 'Building open-source tools for academic collaboration.',
      location: 'Toronto, Canada',
      created_at: daysAgo(380),
    },
    {
      id: 'u-amina',
      email: 'amina.diallo@academic-hub.app',
      username: 'amina',
      full_name: 'Amina Diallo',
      avatar_url: null,
      role: 'Design Student',
      department: 'Interaction Design',
      bio: 'UI/UX designer focused on accessible learning platforms.',
      location: 'Dakar, Senegal',
      created_at: daysAgo(260),
    },
    {
      id: 'u-lucas',
      email: 'lucas.martin@academic-hub.app',
      username: 'lucas',
      full_name: 'Lucas Martin',
      avatar_url: null,
      role: 'Data Science Student',
      department: 'Data Science',
      bio: 'Turning messy datasets into useful insights.',
      location: 'Paris, France',
      created_at: daysAgo(190),
    },
  ];

  const posts: DemoPostRow[] = [
    {
      id: 'post-1',
      author_id: 'u-sofia',
      content:
        'Just published a short guide on fine-tuning small language models for tutoring. Happy to share the notebook with anyone working on ed-tech!',
      tags: ['AI', 'Research', 'EdTech'],
      likes: 42,
      created_at: minutesAgo(35),
    },
    {
      id: 'post-2',
      author_id: 'u-daniel',
      content:
        'Looking for two collaborators to help finish an open-source timetable planner built with Angular. Designers and backend folks welcome.',
      tags: ['Angular', 'OpenSource', 'Collaboration'],
      likes: 27,
      created_at: minutesAgo(180),
    },
    {
      id: 'post-3',
      author_id: 'u-amina',
      content:
        'Accessibility check: remember to test your dashboards with keyboard navigation and screen readers. Small changes, huge impact.',
      tags: ['Design', 'Accessibility', 'UX'],
      likes: 63,
      created_at: minutesAgo(420),
    },
    {
      id: 'post-4',
      author_id: 'u-lucas',
      content:
        'Sharing a clean dataset of university course outcomes. Great for anyone practising regression or classification.',
      tags: ['DataScience', 'Dataset', 'Python'],
      likes: 18,
      created_at: minutesAgo(1440),
    },
    {
      id: 'post-5',
      author_id: 'u-demo',
      content:
        'Excited to join Academic Hub! Currently exploring Angular signals and Supabase. Any tips for structuring a large app?',
      tags: ['Angular', 'Supabase'],
      likes: 9,
      created_at: minutesAgo(2880),
    },
  ];

  const comments: DemoCommentRow[] = [
    {
      id: 'comment-1',
      post_id: 'post-1',
      author_id: 'u-demo',
      content: 'This is exactly what I needed. Please share the notebook!',
      created_at: minutesAgo(20),
    },
    {
      id: 'comment-2',
      post_id: 'post-1',
      author_id: 'u-daniel',
      content: 'Would love to see the evaluation setup too.',
      created_at: minutesAgo(12),
    },
    {
      id: 'comment-3',
      post_id: 'post-3',
      author_id: 'u-sofia',
      content: 'Great reminder. Keyboard navigation is so often forgotten.',
      created_at: minutesAgo(300),
    },
  ];

  const projects: DemoProjectRow[] = [
    {
      id: 'project-1',
      title: 'AI Study Assistant',
      description:
        'An ML-powered study companion that creates personalized revision plans and practice questions from your course notes.',
      owner_id: 'u-sofia',
      status: 'Active',
      progress: 75,
      category: 'Artificial Intelligence',
      image_url: null,
      technologies: ['Angular', 'Python', 'AWS'],
      views: 1240,
      member_count: 8,
      start_date: daysAgo(120).slice(0, 10),
      end_date: null,
      created_at: daysAgo(120),
    },
    {
      id: 'project-2',
      title: 'Campus Timetable Planner',
      description:
        'Open-source timetable builder that helps students avoid clashes and share schedules with their study groups.',
      owner_id: 'u-daniel',
      status: 'Active',
      progress: 55,
      category: 'Web Development',
      image_url: null,
      technologies: ['Angular', 'TypeScript', 'Supabase'],
      views: 890,
      member_count: 5,
      start_date: daysAgo(80).slice(0, 10),
      end_date: null,
      created_at: daysAgo(80),
    },
    {
      id: 'project-3',
      title: 'Accessible Design Kit',
      description:
        'A reusable component library focused on accessibility and inclusive design for academic platforms.',
      owner_id: 'u-amina',
      status: 'Planning',
      progress: 20,
      category: 'Design',
      image_url: null,
      technologies: ['Figma', 'CSS', 'Angular'],
      views: 410,
      member_count: 3,
      start_date: daysAgo(30).slice(0, 10),
      end_date: null,
      created_at: daysAgo(30),
    },
    {
      id: 'project-4',
      title: 'Course Outcome Dashboard',
      description:
        'Interactive dashboard that visualizes course outcomes and helps departments spot gaps in learning objectives.',
      owner_id: 'u-lucas',
      status: 'Completed',
      progress: 100,
      category: 'Data Science',
      image_url: null,
      technologies: ['Python', 'Pandas', 'Plotly'],
      views: 1560,
      member_count: 4,
      start_date: daysAgo(210).slice(0, 10),
      end_date: daysAgo(15).slice(0, 10),
      created_at: daysAgo(210),
    },
  ];

  const communities: DemoCommunityRow[] = [
    {
      id: 'community-1',
      name: 'Artificial Intelligence Hub',
      description:
        'A community for students and researchers exploring machine learning, NLP and computer vision.',
      category: 'Artificial Intelligence',
      image_url: null,
      member_count: 1240,
      created_by: 'u-sofia',
      created_at: daysAgo(300),
    },
    {
      id: 'community-2',
      name: 'Web Development Guild',
      description:
        'Frontend and backend developers sharing tutorials, code reviews and project opportunities.',
      category: 'Web Development',
      image_url: null,
      member_count: 980,
      created_by: 'u-daniel',
      created_at: daysAgo(260),
    },
    {
      id: 'community-3',
      name: 'Design & UX Circle',
      description:
        'Designers exchanging feedback on portfolios, design systems and accessible interfaces.',
      category: 'Design',
      image_url: null,
      member_count: 640,
      created_by: 'u-amina',
      created_at: daysAgo(180),
    },
    {
      id: 'community-4',
      name: 'Data Science Lab',
      description:
        'Hands-on community for data analysis, statistics and machine learning competitions.',
      category: 'Data Science',
      image_url: null,
      member_count: 720,
      created_by: 'u-lucas',
      created_at: daysAgo(150),
    },
  ];

  const messages: DemoMessageRow[] = [
    {
      id: 'message-1',
      sender_id: 'u-sofia',
      recipient_id: 'u-demo',
      content: 'Hey Alex! Saw you joined the AI Hub. Want to help with the study assistant?',
      read: false,
      created_at: minutesAgo(50),
    },
    {
      id: 'message-2',
      sender_id: 'u-demo',
      recipient_id: 'u-sofia',
      content: 'Hi Sofia! Absolutely, I would love to contribute.',
      read: true,
      created_at: minutesAgo(45),
    },
    {
      id: 'message-3',
      sender_id: 'u-sofia',
      recipient_id: 'u-demo',
      content: 'Great! I will share the repository later today.',
      read: false,
      created_at: minutesAgo(12),
    },
    {
      id: 'message-4',
      sender_id: 'u-daniel',
      recipient_id: 'u-demo',
      content: 'Are you interested in the timetable planner? We need an extra pair of hands.',
      read: true,
      created_at: minutesAgo(240),
    },
  ];

  return {
    version: STORE_VERSION,
    accounts: [
      { id: 'u-demo', email: 'demo@academic-hub.app', name: 'Alex Morgan' },
    ],
    profiles,
    posts,
    comments,
    projects,
    communities,
    messages,
    joinedProjects: {},
    joinedCommunities: {},
    likedPosts: {},
  };
}

function hasStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function readStore(): DemoStore {
  if (!hasStorage()) {
    return createSeedStore();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoStore;
      if (parsed && parsed.version === STORE_VERSION) {
        return parsed;
      }
    }
  } catch {
    // Corrupted or inaccessible storage: fall through to a fresh seed.
  }

  const store = createSeedStore();
  writeStore(store);
  return store;
}

function writeStore(store: DemoStore): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota or privacy-mode errors; the app still works in memory.
  }
}

function currentAccountRow(store: DemoStore, id: string | null | undefined): DemoProfileRow | undefined {
  if (!id) return undefined;
  return store.profiles.find((profile) => profile.id === id);
}

function profileName(row: DemoProfileRow | undefined): string {
  return row?.full_name?.trim() || row?.username?.trim() || 'Unknown member';
}

function toProfile(row: DemoProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    department: row.department,
    bio: row.bio,
    location: row.location,
    createdAt: row.created_at,
  };
}

export function demoAuthenticate(
  email: string,
  password: string,
  fullName?: string
): DemoAccount {
  const store = readStore();
  const normalized = email.trim().toLowerCase();
  let account = store.accounts.find((entry) => entry.email === normalized);

  if (!account) {
    const name = fullName?.trim() || nameFromEmail(normalized);
    account = {
      id: uid('user'),
      email: normalized,
      name,
    };
    store.accounts.push(account);
    store.profiles.push({
      id: account.id,
      email: normalized,
      username: null,
      full_name: name,
      avatar_url: null,
      role: 'Student',
      department: null,
      bio: null,
      location: null,
      created_at: new Date().toISOString(),
    });
    writeStore(store);
    return account;
  }

  if (fullName?.trim() && fullName.trim() !== account.name) {
    account.name = fullName.trim();
    const profile = currentAccountRow(store, account.id);
    if (profile) {
      profile.full_name = account.name;
    }
    writeStore(store);
  }

  void password;
  return account;
}

export function demoUpdateEmail(id: string, email: string): DemoAccount | null {
  const store = readStore();
  const normalized = email.trim().toLowerCase();
  const account = store.accounts.find((entry) => entry.id === id);
  if (!account) return null;

  account.email = normalized;
  const profile = currentAccountRow(store, id);
  if (profile) {
    profile.email = normalized;
  }
  writeStore(store);
  return account;
}

export function demoGetAccount(id: string): DemoAccount | null {
  return readStore().accounts.find((account) => account.id === id) ?? null;
}

export function demoListPosts(currentId: string | null): Post[] {
  const store = readStore();
  const liked = currentId ? store.likedPosts[currentId] ?? [] : [];
  const commentCounts = new Map<string, number>();
  for (const comment of store.comments) {
    commentCounts.set(comment.post_id, (commentCounts.get(comment.post_id) ?? 0) + 1);
  }

  return [...store.posts]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((row) => {
      const author = currentAccountRow(store, row.author_id);
      const name = profileName(author);
      return {
        id: row.id,
        authorId: row.author_id,
        content: row.content,
        tags: row.tags,
        createdAt: row.created_at,
        authorName: name,
        authorInitials: initials(name),
        likes: row.likes,
        comments: commentCounts.get(row.id) ?? 0,
        liked: liked.includes(row.id),
      };
    });
}

export function demoCreatePost(authorId: string, content: string, tags: string[]): void {
  const store = readStore();
  store.posts.push({
    id: uid('post'),
    author_id: authorId,
    content,
    tags,
    likes: 0,
    created_at: new Date().toISOString(),
  });
  writeStore(store);
}

export function demoSetLiked(postId: string, userId: string, liked: boolean): void {
  const store = readStore();
  const post = store.posts.find((row) => row.id === postId);
  if (!post) return;

  const list = store.likedPosts[userId] ?? [];
  const alreadyLiked = list.includes(postId);

  if (liked && !alreadyLiked) {
    list.push(postId);
    post.likes += 1;
  } else if (!liked && alreadyLiked) {
    store.likedPosts[userId] = list.filter((id) => id !== postId);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    return;
  }

  store.likedPosts[userId] = list;
  writeStore(store);
}

export function demoRemovePost(postId: string): void {
  const store = readStore();
  store.posts = store.posts.filter((row) => row.id !== postId);
  store.comments = store.comments.filter((row) => row.post_id !== postId);
  for (const key of Object.keys(store.likedPosts)) {
    store.likedPosts[key] = store.likedPosts[key].filter((id) => id !== postId);
  }
  writeStore(store);
}

export function demoListComments(postId: string): PostComment[] {
  const store = readStore();
  return store.comments
    .filter((row) => row.post_id === postId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((row) => {
      const author = currentAccountRow(store, row.author_id);
      const name = profileName(author);
      return {
        id: row.id,
        postId: row.post_id,
        authorId: row.author_id,
        authorName: name,
        authorInitials: initials(name),
        content: row.content,
        createdAt: row.created_at,
      };
    });
}

export function demoAddComment(postId: string, authorId: string, content: string): void {
  const store = readStore();
  store.comments.push({
    id: uid('comment'),
    post_id: postId,
    author_id: authorId,
    content,
    created_at: new Date().toISOString(),
  });
  writeStore(store);
}

function toProject(
  row: DemoProjectRow,
  store: DemoStore,
  currentId: string | null
): Project {
  const owner = currentAccountRow(store, row.owner_id);
  const name = profileName(owner);
  const joined = currentId ? store.joinedProjects[currentId] ?? [] : [];

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    progress: row.progress,
    category: row.category,
    image: row.image_url,
    technologies: row.technologies,
    views: row.views,
    membersCount: row.member_count,
    ownerId: row.owner_id,
    ownerName: name,
    ownerInitials: initials(name),
    isMember: joined.includes(row.id),
    createdAt: row.created_at,
  };
}

export function demoListProjects(currentId: string | null): Project[] {
  const store = readStore();
  return [...store.projects]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((row) => toProject(row, store, currentId));
}

export function demoGetProject(
  id: string,
  currentId: string | null
): ProjectDetail | null {
  const store = readStore();
  const row = store.projects.find((project) => project.id === id);
  if (!row) return null;

  const owner = currentAccountRow(store, row.owner_id);
  return {
    ...toProject(row, store, currentId),
    ownerRole: owner?.role ?? 'Member',
    startDate: row.start_date,
    endDate: row.end_date,
  };
}

export function demoCreateProject(ownerId: string, input: CreateProjectInput): void {
  const store = readStore();
  const id = uid('project');
  store.projects.push({
    id,
    title: input.title,
    description: input.description,
    owner_id: ownerId,
    status: 'Planning',
    progress: 0,
    category: 'General',
    image_url: null,
    technologies: input.technologies,
    views: 0,
    member_count: 1,
    start_date: new Date().toISOString().slice(0, 10),
    end_date: null,
    created_at: new Date().toISOString(),
  });
  store.joinedProjects[ownerId] = [...(store.joinedProjects[ownerId] ?? []), id];
  writeStore(store);
}

export function demoSetProjectMembership(
  projectId: string,
  userId: string,
  join: boolean
): void {
  const store = readStore();
  const project = store.projects.find((row) => row.id === projectId);
  if (!project) return;

  const list = store.joinedProjects[userId] ?? [];
  const alreadyJoined = list.includes(projectId);

  if (join && !alreadyJoined) {
    project.member_count += 1;
    store.joinedProjects[userId] = [...list, projectId];
  } else if (!join && alreadyJoined) {
    project.member_count = Math.max(0, project.member_count - 1);
    store.joinedProjects[userId] = list.filter((id) => id !== projectId);
  } else {
    return;
  }

  writeStore(store);
}

function toCommunity(
  row: DemoCommunityRow,
  store: DemoStore,
  currentId: string | null
): Community {
  const joined = currentId ? store.joinedCommunities[currentId] ?? [] : [];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    image: row.image_url,
    members: row.member_count,
    joined: joined.includes(row.id),
    initials: initials(row.name),
    createdAt: row.created_at,
  };
}

export function demoListCommunities(currentId: string | null): Community[] {
  const store = readStore();
  return [...store.communities]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((row) => toCommunity(row, store, currentId));
}

export function demoCreateCommunity(
  createdBy: string,
  input: CreateCommunityInput
): void {
  const store = readStore();
  const id = uid('community');
  store.communities.push({
    id,
    name: input.name,
    description: input.description,
    category: input.category || 'General',
    image_url: null,
    member_count: 1,
    created_by: createdBy,
    created_at: new Date().toISOString(),
  });
  store.joinedCommunities[createdBy] = [
    ...(store.joinedCommunities[createdBy] ?? []),
    id,
  ];
  writeStore(store);
}

export function demoSetCommunityJoined(
  communityId: string,
  userId: string,
  join: boolean
): void {
  const store = readStore();
  const community = store.communities.find((row) => row.id === communityId);
  if (!community) return;

  const list = store.joinedCommunities[userId] ?? [];
  const alreadyJoined = list.includes(communityId);

  if (join && !alreadyJoined) {
    community.member_count += 1;
    store.joinedCommunities[userId] = [...list, communityId];
  } else if (!join && alreadyJoined) {
    community.member_count = Math.max(0, community.member_count - 1);
    store.joinedCommunities[userId] = list.filter((id) => id !== communityId);
  } else {
    return;
  }

  writeStore(store);
}

export function demoListUsers(currentId: string): ChatUser[] {
  const store = readStore();
  return store.profiles
    .filter((row) => row.id !== currentId)
    .sort((a, b) => profileName(a).localeCompare(profileName(b)))
    .map((row) => {
      const name = profileName(row);
      return {
        id: row.id,
        name,
        initials: initials(name),
        avatarUrl: row.avatar_url,
        role: row.role,
      };
    });
}

function toMessage(row: DemoMessageRow): ChatMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    content: row.content,
    read: row.read,
    createdAt: row.created_at,
  };
}

export function demoListInbox(currentId: string): ChatMessage[] {
  const store = readStore();
  return store.messages
    .filter(
      (row) => row.sender_id === currentId || row.recipient_id === currentId
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(toMessage);
}

export function demoListConversation(
  currentId: string,
  userId: string
): ChatMessage[] {
  if (currentId === userId) return [];
  const store = readStore();
  return store.messages
    .filter(
      (row) =>
        (row.sender_id === currentId && row.recipient_id === userId) ||
        (row.sender_id === userId && row.recipient_id === currentId)
    )
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map(toMessage);
}

export function demoSendMessage(
  senderId: string,
  recipientId: string,
  content: string
): void {
  const store = readStore();
  store.messages.push({
    id: uid('message'),
    sender_id: senderId,
    recipient_id: recipientId,
    content,
    read: false,
    created_at: new Date().toISOString(),
  });
  writeStore(store);
}

export function demoMarkConversationRead(currentId: string, userId: string): void {
  const store = readStore();
  let changed = false;
  for (const row of store.messages) {
    if (
      row.recipient_id === currentId &&
      row.sender_id === userId &&
      !row.read
    ) {
      row.read = true;
      changed = true;
    }
  }
  if (changed) writeStore(store);
}

export function demoGetProfile(id: string): Profile | null {
  const store = readStore();
  const row = currentAccountRow(store, id);
  return row ? toProfile(row) : null;
}

export function demoUpdateProfile(id: string, input: UpdateProfileInput): void {
  const store = readStore();
  const row = currentAccountRow(store, id);
  if (!row) return;

  row.username = input.username;
  row.full_name = input.fullName;
  row.role = input.role;
  row.department = input.department;
  row.bio = input.bio;
  row.location = input.location;

  const account = store.accounts.find((entry) => entry.id === id);
  if (account && input.fullName) {
    account.name = input.fullName;
  }
  writeStore(store);
}

export function demoCounts(): DashboardStats {
  const store = readStore();
  return {
    students: store.profiles.length,
    communities: store.communities.length,
    projects: store.projects.length,
    discussions: store.posts.length,
  };
}
