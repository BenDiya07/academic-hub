import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { TextareaModule } from 'primeng/textarea';

import type { Project } from '../../core/models';
import { ProjectsService } from '../../core/services/projects.service';

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
    ProgressBarModule,
    DialogModule,
    DividerModule,
    TextareaModule,
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {
  private readonly projectsService = inject(ProjectsService);
  private readonly router = inject(Router);

  showCreateDialog = signal<boolean>(false);
  searchTerm = signal<string>('');
  selectedFilter = signal<string>('All');

  newProjectTitle = signal<string>('');
  newProjectDescription = signal<string>('');
  newProjectTechnologies = signal<string>('');

  projects = signal<Project[]>([]);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  error = signal<string | null>(null);

  readonly technologies = computed<string[]>(() => {
    const set = new Set<string>();
    for (const project of this.projects()) {
      for (const tech of project.technologies) set.add(tech);
    }
    return ['All', ...Array.from(set).sort()];
  });

  readonly stats = computed(() => {
    const list = this.projects();
    return [
      { label: 'Projects', value: list.length, icon: 'pi pi-briefcase' },
      {
        label: 'Collaborators',
        value: list.reduce((sum, project) => sum + project.membersCount, 0),
        icon: 'pi pi-users',
      },
      {
        label: 'Active Projects',
        value: list.filter((project) => project.status === 'Active').length,
        icon: 'pi pi-rocket',
      },
      {
        label: 'Completed',
        value: list.filter((project) => project.status === 'Completed').length,
        icon: 'pi pi-trophy',
      },
    ];
  });

  readonly categories = computed(() => {
    const counts = new Map<string, number>();
    for (const project of this.projects()) {
      counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
    }
    return Array.from(counts, ([name, count]) => ({
      icon: 'pi pi-folder',
      name,
      count,
    }));
  });

  readonly trendingProjects = computed(() =>
    [...this.projects()].sort((a, b) => b.views - a.views).slice(0, 3)
  );

  readonly filteredProjects = computed(() => {
    let list = this.projects();

    const filter = this.selectedFilter();
    if (filter !== 'All') {
      list = list.filter((project) => project.technologies.includes(filter));
    }

    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      list = list.filter(
        (project) =>
          project.title.toLowerCase().includes(term) ||
          project.description.toLowerCase().includes(term)
      );
    }

    return list;
  });

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.projects.set(await this.projectsService.list());
    } catch (error) {
      this.error.set(this.message(error));
    } finally {
      this.loading.set(false);
    }
  }

  viewProject(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }

  scrollToProjects(): void {
    document
      .getElementById('projects-list')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async createProject(): Promise<void> {
    const title = this.newProjectTitle().trim();
    if (!title || this.submitting()) return;

    const technologies = this.newProjectTechnologies()
      .split(',')
      .map((tech) => tech.trim())
      .filter(Boolean);

    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.projectsService.create({
        title,
        description: this.newProjectDescription().trim(),
        technologies,
      });
      this.resetForm();
      this.showCreateDialog.set(false);
      await this.load();
    } catch (error) {
      this.error.set(this.message(error));
    } finally {
      this.submitting.set(false);
    }
  }

  async toggleMembership(project: Project): Promise<void> {
    const join = !project.isMember;
    this.patchProject(project.id, {
      isMember: join,
      membersCount: project.membersCount + (join ? 1 : -1),
    });

    try {
      await this.projectsService.setMembership(project.id, join);
    } catch (error) {
      this.patchProject(project.id, {
        isMember: project.isMember,
        membersCount: project.membersCount,
      });
      this.error.set(this.message(error));
    }
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

  private resetForm(): void {
    this.newProjectTitle.set('');
    this.newProjectDescription.set('');
    this.newProjectTechnologies.set('');
  }

  private patchProject(id: string, patch: Partial<Project>): void {
    this.projects.update((list) =>
      list.map((project) => (project.id === id ? { ...project, ...patch } : project))
    );
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'An unexpected error occurred.';
  }
}
