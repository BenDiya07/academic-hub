import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarModule } from 'primeng/avatar';

interface Project {
  id: number;
  title: string;
  description: string;
  owner: {
    name: string;
    avatar: string;
    role: string;
  };
  technologies: string[];
  progress: number;
  members: number;
  status: 'Active' | 'Completed' | 'Planning';
  views?: number;
  startDate: string;
  endDate?: string;
  category: string;
  image?: string;
}

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ChipModule,
    DividerModule,
    ProgressBarModule,
    AvatarModule,
  ],
  template: `
    <div class="project-details-container">
      @if (project(); as proj) {
        <!-- BACK BUTTON -->
        <p-button
          (click)="goBack()"
          icon="pi pi-arrow-left"
          label="Back"
          [text]="true"
          severity="secondary"
          class="mb-3">
        </p-button>

        <!-- HEADER -->
        <div class="details-header">
          <h1>{{ proj.title }}</h1>
          <p-chip
            [label]="proj.status"
            [ngClass]="getStatusClass(proj.status)"
            class="status-chip">
          </p-chip>
        </div>

        <!-- OWNER INFO -->
        <p-card class="owner-card mb-3">
          <div class="owner-section">
            <p-avatar
              [label]="proj.owner.avatar"
              shape="circle"
              size="large">
            </p-avatar>
            <div class="owner-info">
              <p class="owner-name">{{ proj.owner.name }}</p>
              <p class="owner-role">{{ proj.owner.role }}</p>
            </div>
          </div>
        </p-card>

        <!-- MAIN CONTENT -->
        <div class="details-content">
          <!-- DESCRIPTION -->
          <p-card class="mb-3">
            <p class="card-title">About</p>
            <p>{{ proj.description }}</p>
          </p-card>

          <!-- TECHNOLOGIES -->
          <p-card class="mb-3">
            <p class="card-title">Technologies</p>
            <div class="tech-list">
              @for (tech of proj.technologies; track tech) {
                <p-chip [label]="tech" class="tech-chip"></p-chip>
              }
            </div>
          </p-card>

          <!-- PROGRESS & STATS -->
          <p-card class="mb-3">
            <p class="card-title">Progress & Stats</p>
            <div class="progress-section">
              <div class="progress-item">
                <label>Progress: {{ proj.progress }}%</label>
                <p-progressBar [value]="proj.progress"></p-progressBar>
              </div>

              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Category</span>
                  <span class="stat-value">{{ proj.category }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Members</span>
                  <span class="stat-value">{{ proj.members }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Views</span>
                  <span class="stat-value">{{ proj.views || 0 }}</span>
                </div>
              </div>
            </div>
          </p-card>

          <!-- ACTIONS -->
          <div class="actions-section">
            <p-button
              label="Join Project"
              icon="pi pi-user-plus"
              severity="success">
            </p-button>
            <p-button
              label="Contact Owner"
              icon="pi pi-envelope"
              severity="info"
              [text]="true">
            </p-button>
            <p-button
              label="Share"
              icon="pi pi-share-alt"
              severity="secondary"
              [text]="true">
            </p-button>
          </div>
        </div>
      } @else {
        <p-card>
          <p class="text-center">Project not found</p>
        </p-card>
      }
    </div>
  `,
  styles: [`
    .project-details-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .details-header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0;
      color: #0f172a;
    }

    .status-chip {
      font-size: 0.9rem;
    }

    .owner-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .owner-section {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .owner-info {
      flex: 1;
    }

    .owner-name {
      font-size: 1.2rem;
      font-weight: 700;
      margin: 0;
    }

    .owner-role {
      font-size: 0.95rem;
      opacity: 0.9;
      margin: 0;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 1rem;
    }

    .tech-list {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tech-chip {
      background-color: #eef2ff !important;
      color: #4f46e5 !important;
    }

    .progress-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .progress-item {
      display: flex;
      flex-direction: column;
    }

    .progress-item label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #0f172a;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
    }

    .actions-section {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-top: 2rem;
    }

    .actions-section p-button {
      flex: 1;
      min-width: 150px;
    }

    .mb-3 {
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .project-details-container {
        padding: 1rem;
      }

      .details-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .details-header h1 {
        font-size: 1.8rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-section {
        flex-direction: column;
      }
    }
  `],
})
export class ProjectDetails implements OnInit {
  project = signal<Project | null>(null);
  projectId: number | null = null;

  // Tous les projets (même source que Projects)
  allProjects: Project[] = [
    {
      id: 1,
      title: 'AI Study Assistant',
      description: 'Machine learning platform for helping students with personalized learning paths and real-time assistance.',
      owner: { name: 'Ben Diya', avatar: 'BD', role: 'Project Lead' },
      technologies: ['Angular', 'AWS', 'Python', 'TensorFlow'],
      progress: 75,
      members: 4,
      status: 'Active',
      views: 120,
      startDate: '2024-01-15',
      category: 'Artificial Intelligence',
    },
    {
      id: 2,
      title: 'Smart Campus',
      description: 'IoT campus management system for resource optimization, energy efficiency and campus safety.',
      owner: { name: 'Amina Diallo', avatar: 'AD', role: 'Tech Lead' },
      technologies: ['React', 'NodeJS', 'AWS', 'IoT'],
      progress: 45,
      members: 7,
      status: 'Active',
      views: 98,
      startDate: '2024-02-01',
      category: 'Cloud Computing',
    },
    {
      id: 3,
      title: 'Academic Hub',
      description: 'Community platform connecting students and fostering collaboration across all departments.',
      owner: { name: 'Mohamed Hassan', avatar: 'MH', role: 'Founder' },
      technologies: ['Angular', 'Spring Boot', 'PostgreSQL'],
      progress: 90,
      members: 5,
      status: 'Completed',
      views: 156,
      startDate: '2023-09-10',
      endDate: '2024-05-20',
      category: 'Web Development',
    },
    {
      id: 4,
      title: 'Cloud Notes',
      description: 'Real-time collaborative note-taking application with markdown support and offline capability.',
      owner: { name: 'Sarah Jane', avatar: 'SJ', role: 'Lead Developer' },
      technologies: ['React', 'Firebase', 'AWS'],
      progress: 60,
      members: 3,
      status: 'Active',
      views: 76,
      startDate: '2024-03-05',
      category: 'Web Development',
    },
    {
      id: 5,
      title: 'Cybersecurity Trainer',
      description: 'Interactive platform for learning cybersecurity concepts, best practices and ethical hacking.',
      owner: { name: 'Jean Kabila', avatar: 'JK', role: 'Security Expert' },
      technologies: ['Angular', 'Python', 'Docker'],
      progress: 55,
      members: 6,
      status: 'Active',
      views: 89,
      startDate: '2024-02-20',
      category: 'Cybersecurity',
    },
    {
      id: 6,
      title: 'Mobile Learning App',
      description: 'Cross-platform mobile application for distance learning with video streaming and assessments.',
      owner: { name: 'Lisa Chen', avatar: 'LC', role: 'Mobile Architect' },
      technologies: ['React Native', 'Firebase'],
      progress: 40,
      members: 4,
      status: 'Planning',
      views: 45,
      startDate: '2024-04-01',
      category: 'Mobile Development',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.projectId = parseInt(params['id'], 10);
      const found = this.allProjects.find(p => p.id === this.projectId);
      this.project.set(found || null);
    });
  }

  goBack() {
    this.router.navigate(['/projects']);
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
