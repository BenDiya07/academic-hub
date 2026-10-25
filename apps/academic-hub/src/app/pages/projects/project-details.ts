import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarModule } from 'primeng/avatar';

import type { ProjectDetail } from '../../core/models';
import { ProjectsService } from '../../core/services/projects.service';

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
      @if (loading()) {
        <p-card>
          <p class="text-center"><i class="pi pi-spin pi-spinner"></i> Loading project…</p>
        </p-card>
      } @else if (error()) {
        <p-card>
          <p class="text-center">{{ error() }}</p>
          <div class="actions-section">
            <p-button (onClick)="goBack()" label="Back to projects" icon="pi pi-arrow-left" [text]="true"></p-button>
          </div>
        </p-card>
      } @else if (project(); as proj) {
        <p-button
          (onClick)="goBack()"
          icon="pi pi-arrow-left"
          label="Back"
          [text]="true"
          severity="secondary"
          class="mb-3">
        </p-button>

        <div class="details-header">
          <h1>{{ proj.title }}</h1>
          <p-chip [label]="proj.status" [ngClass]="getStatusClass(proj.status)" class="status-chip"></p-chip>
        </div>

        <p-card class="owner-card mb-3">
          <div class="owner-section">
            <p-avatar [label]="proj.ownerInitials" shape="circle" size="large"></p-avatar>
            <div class="owner-info">
              <p class="owner-name">{{ proj.ownerName }}</p>
              <p class="owner-role">{{ proj.ownerRole }}</p>
            </div>
          </div>
        </p-card>

        <div class="details-content">
          <p-card class="mb-3">
            <p class="card-title">About</p>
            <p>{{ proj.description }}</p>
          </p-card>

          <p-card class="mb-3">
            <p class="card-title">Technologies</p>
            <div class="tech-list">
              @for (tech of proj.technologies; track tech) {
                <p-chip [label]="tech" class="tech-chip"></p-chip>
              }
            </div>
          </p-card>

          <p-card class="mb-3">
            <p class="card-title">Progress &amp; Stats</p>
            <div class="progress-section">
              <div class="progress-item">
                <span class="progress-label">Progress: {{ proj.progress }}%</span>
                <p-progressBar [value]="proj.progress"></p-progressBar>
              </div>

              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Category</span>
                  <span class="stat-value">{{ proj.category }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Members</span>
                  <span class="stat-value">{{ proj.membersCount }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Views</span>
                  <span class="stat-value">{{ proj.views || 0 }}</span>
                </div>
              </div>
            </div>
          </p-card>

          <div class="actions-section">
            <p-button
              [label]="proj.isMember ? 'Leave Project' : 'Join Project'"
              [icon]="proj.isMember ? 'pi pi-check' : 'pi pi-user-plus'"
              [severity]="proj.isMember ? 'secondary' : 'success'"
              (onClick)="toggleMembership()">
            </p-button>
            <p-button
              label="Contact Owner"
              icon="pi pi-envelope"
              severity="info"
              [text]="true"
              (onClick)="contactOwner()">
            </p-button>
            <p-button
              label="Share"
              icon="pi pi-share-alt"
              severity="secondary"
              [text]="true"
              (onClick)="shareProject()">
            </p-button>
          </div>

          @if (shareStatus()) {
            <p class="share-status">{{ shareStatus() }}</p>
          }
        </div>
      } @else {
        <p-card>
          <p class="text-center">Project not found</p>
          <div class="actions-section">
            <p-button (onClick)="goBack()" label="Back to projects" icon="pi pi-arrow-left" [text]="true"></p-button>
          </div>
        </p-card>
      }
    </div>
  `,
  styles: [
    `
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
        gap: 1rem;
      }

      .details-header h1 {
        font-size: 2.5rem;
        font-weight: 800;
        margin: 0;
        color: #0f172a;
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

      .share-status {
        margin: 0.75rem 0 0;
        color: #047857;
        font-size: 0.9rem;
        font-weight: 600;
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
    `,
  ],
})
export class ProjectDetails implements OnInit {
  private readonly projectsService = inject(ProjectsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  project = signal<ProjectDetail | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  shareStatus = signal<string | null>(null);

  private projectId = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Project not found.');
      return;
    }
    this.projectId = id;
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.project.set(await this.projectsService.getById(this.projectId));
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to load project.');
    } finally {
      this.loading.set(false);
    }
  }

  async toggleMembership(): Promise<void> {
    const current = this.project();
    if (!current) return;

    const join = !current.isMember;
    this.project.set({
      ...current,
      isMember: join,
      membersCount: current.membersCount + (join ? 1 : -1),
    });

    try {
      await this.projectsService.setMembership(current.id, join);
    } catch (error) {
      this.project.set(current);
      this.error.set(error instanceof Error ? error.message : 'Unable to update membership.');
    }
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  contactOwner(): void {
    const project = this.project();
    if (!project) return;
    void this.router.navigate(['/chat'], {
      queryParams: { user: project.ownerId },
    });
  }

  async shareProject(): Promise<void> {
    const project = this.project();
    if (!project) return;

    const url = window.location.href;
    const shareData = {
      title: project.title,
      text: project.description,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        this.shareStatus.set('Project shared.');
      } else {
        await navigator.clipboard.writeText(url);
        this.shareStatus.set('Link copied to clipboard.');
      }
    } catch {
      this.shareStatus.set('Unable to share this project.');
    }

    setTimeout(() => this.shareStatus.set(null), 3000);
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
