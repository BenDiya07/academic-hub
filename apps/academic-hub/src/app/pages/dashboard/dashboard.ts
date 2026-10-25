import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import type {
  Community,
  DashboardStats,
  Post,
  Project,
} from '../../core/models';
import { CommunitiesService } from '../../core/services/communities.service';
import { PostsService } from '../../core/services/posts.service';
import { ProjectsService } from '../../core/services/projects.service';
import { StatsService } from '../../core/services/stats.service';
import { formatCount, timeAgo } from '../../core/utils/format';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ButtonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly statsService = inject(StatsService);
  private readonly projectsService = inject(ProjectsService);
  private readonly communitiesService = inject(CommunitiesService);
  private readonly postsService = inject(PostsService);

  readonly formatCount = formatCount;
  readonly timeAgo = timeAgo;

  stats = signal<DashboardStats | null>(null);
  projects = signal<Project[]>([]);
  communities = signal<Community[]>([]);
  posts = signal<Post[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  readonly trendingProjects = computed(() =>
    [...this.projects()].sort((a, b) => b.views - a.views).slice(0, 3)
  );

  readonly popularCommunities = computed(() =>
    [...this.communities()].sort((a, b) => b.members - a.members).slice(0, 3)
  );

  readonly recentDiscussions = computed(() => this.posts().slice(0, 3));

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [stats, projects, communities, posts] = await Promise.all([
        this.statsService.counts(),
        this.projectsService.list(),
        this.communitiesService.list(),
        this.postsService.list(),
      ]);
      this.stats.set(stats);
      this.projects.set(projects);
      this.communities.set(communities);
      this.posts.set(posts);
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Unable to load your dashboard.'
      );
    } finally {
      this.loading.set(false);
    }
  }
}
