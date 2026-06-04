import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

interface Project {
  id: number;
  title: string;
  description: string;
  owner: {
    name: string;
    avatar: string;
  };
  technologies: string[];
  progress: number;
  members: number;
  membersAvatars: string[];
  status: 'Active' | 'Completed' | 'Planning';
  views?: number;
  category: string;
  image?: string;
}

interface Stat {
  label: string;
  value: number;
  icon: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    ChipModule,
    InputTextModule,
    SelectModule,
    ProgressBarModule,
    DialogModule,
    DividerModule,
    AvatarModule,
    TextareaModule,
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects {
  showCreateDialog = signal<boolean>(false);
  searchTerm = signal<string>('');
  selectedFilter = signal<string>('All');

  stats = signal<Stat[]>([
    { label: 'Projects', value: 412, icon: 'folder' },
    { label: 'Collaborators', value: 2547, icon: 'users' },
    { label: 'Active Projects', value: 138, icon: 'rocket' },
    { label: 'Completed', value: 89, icon: 'trophy' },
  ]);

  technologies = signal<string[]>([
    'All',
    'Angular',
    'React',
    'AWS',
    'AI',
    'Mobile',
    'Cybersecurity',
  ]);

  projects = signal<Project[]>([
    {
      id: 1,
      title: 'AI Study Assistant',
      description: 'Machine learning platform for helping students with personalized learning paths.',
      owner: { name: 'Ben Diya', avatar: 'BD' },
      technologies: ['Angular', 'AWS', 'Python'],
      progress: 75,
      members: 4,
      membersAvatars: ['BD', 'AD', 'MH', 'SJ'],
      status: 'Active',
      views: 120,
      category: 'Artificial Intelligence',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 2,
      title: 'Smart Campus',
      description: 'IoT campus management system for resource optimization and safety.',
      owner: { name: 'Amina Diallo', avatar: 'AD' },
      technologies: ['React', 'NodeJS', 'AWS'],
      progress: 45,
      members: 7,
      membersAvatars: ['AD', 'MH', 'SJ', 'JK'],
      status: 'Active',
      views: 98,
      category: 'Cloud Computing',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 3,
      title: 'Academic Hub',
      description: 'Community platform connecting students and fostering collaboration.',
      owner: { name: 'Mohamed Hassan', avatar: 'MH' },
      technologies: ['Angular', 'Spring Boot', 'PostgreSQL'],
      progress: 90,
      members: 5,
      membersAvatars: ['MH', 'BD', 'AD', 'SJ'],
      status: 'Completed',
      views: 156,
      category: 'Web Development',
      image: 'https://images.unsplash.com/photo-1531497865146-5235d3b70c68?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 4,
      title: 'Cloud Notes',
      description: 'Real-time collaborative note-taking application.',
      owner: { name: 'Sarah Jane', avatar: 'SJ' },
      technologies: ['React', 'Firebase', 'AWS'],
      progress: 60,
      members: 3,
      membersAvatars: ['SJ', 'JK', 'LC'],
      status: 'Active',
      views: 76,
      category: 'Web Development',
      image: 'https://images.unsplash.com/photo-1517430816045-df4b7de10d7b?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 5,
      title: 'Cybersecurity Trainer',
      description: 'Interactive platform for learning cybersecurity concepts and best practices.',
      owner: { name: 'Jean Kabila', avatar: 'JK' },
      technologies: ['Angular', 'Python', 'Docker'],
      progress: 55,
      members: 6,
      membersAvatars: ['JK', 'MH', 'BD', 'AD'],
      status: 'Active',
      views: 89,
      category: 'Cybersecurity',
      image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 6,
      title: 'Mobile Learning App',
      description: 'Cross-platform mobile application for distance learning.',
      owner: { name: 'Lisa Chen', avatar: 'LC' },
      technologies: ['React Native', 'Firebase'],
      progress: 40,
      members: 4,
      membersAvatars: ['LC', 'AD', 'SJ', 'JK'],
      status: 'Planning',
      views: 45,
      category: 'Mobile Development',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    },
  ]);

  categories = signal([
    { icon: 'AI', name: 'Artificial Intelligence', count: 42 },
    { icon: 'Cloud', name: 'Cloud Computing', count: 38 },
    { icon: 'Security', name: 'Cybersecurity', count: 21 },
    { icon: 'Mobile', name: 'Mobile Development', count: 35 },
    { icon: 'Design', name: 'UI/UX Design', count: 28 },
    { icon: 'Web', name: 'Web Development', count: 67 },
  ]);

  newProject = signal({
    name: '',
    description: '',
    technologies: '',
    visibility: 'Public',
  });

  constructor(private router: Router) {}

  get filteredProjects() {
    let filtered = this.projects();

    if (this.selectedFilter() !== 'All') {
      filtered = filtered.filter(p =>
        p.technologies.includes(this.selectedFilter())
      );
    }

    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  get trendingProjects() {
    return this.projects().sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
  }

  viewProject(projectId: number) {
    this.router.navigate(['/projects', projectId]);
  }

  createProject() {
    if (!this.newProject().name.trim()) return;

    const technologies = this.newProject()
      .technologies.split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const project: Project = {
      id: Date.now(),
      title: this.newProject().name,
      description: this.newProject().description,
      owner: { name: 'You', avatar: 'U' },
      technologies: technologies.length > 0 ? technologies : ['General'],
      progress: 0,
      members: 1,
      membersAvatars: ['U'],
      status: 'Planning',
      views: 0,
      category: 'General',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    };

    this.projects.update(projects => [project, ...projects]);
    this.resetForm();
    this.showCreateDialog.set(false);
  }

  resetForm() {
    this.newProject.set({
      name: '',
      description: '',
      technologies: '',
      visibility: 'Public',
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Completed':
        return 'status-completed';
      case 'Planning':
        return 'status-planning';
      default:
        return '';
    }
  }
}
