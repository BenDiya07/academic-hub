import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';

import type { Community, Post, Project } from '../../core/models';
import { CommunitiesService } from '../../core/services/communities.service';
import { PostsService } from '../../core/services/posts.service';
import { ProjectsService } from '../../core/services/projects.service';
import { timeAgo } from '../../core/utils/format';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, CardModule, ChipModule, InputTextModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectsService = inject(ProjectsService);
  private readonly communitiesService = inject(CommunitiesService);
  private readonly postsService = inject(PostsService);

  readonly timeAgo = timeAgo;

  query = signal('');
  searchInput = signal('');
  projects = signal<Project[]>([]);
  communities = signal<Community[]>([]);
  posts = signal<Post[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  readonly projectResults = computed(() => {
    const term = this.query().toLowerCase();
    if (!term) return [];
    return this.projects()
      .filter(
        (project) =>
          project.title.toLowerCase().includes(term) ||
          project.description.toLowerCase().includes(term) ||
          project.technologies.some((tech) => tech.toLowerCase().includes(term))
      )
      .slice(0, 10);
  });

  readonly communityResults = computed(() => {
    const term = this.query().toLowerCase();
    if (!term) return [];
    return this.communities()
      .filter(
        (community) =>
          community.name.toLowerCase().includes(term) ||
          community.description.toLowerCase().includes(term) ||
          community.category.toLowerCase().includes(term)
      )
      .slice(0, 10);
  });

  readonly postResults = computed(() => {
    const term = this.query().toLowerCase();
    if (!term) return [];
    return this.posts()
      .filter(
        (post) =>
          post.content.toLowerCase().includes(term) ||
          post.tags.some((tag) => tag.toLowerCase().includes(term)) ||
          post.authorName.toLowerCase().includes(term)
      )
      .slice(0, 10);
  });

  readonly resultCount = computed(
    () => this.projectResults().length + this.communityResults().length + this.postResults().length
  );

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const query = params.get('q')?.trim() ?? '';
      this.query.set(query);
      this.searchInput.set(query);
    });
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [projects, communities, posts] = await Promise.all([
        this.projectsService.list(),
        this.communitiesService.list(),
        this.postsService.list(),
      ]);
      this.projects.set(projects);
      this.communities.set(communities);
      this.posts.set(posts);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to run your search.');
    } finally {
      this.loading.set(false);
    }
  }

  submit(): void {
    const value = this.searchInput().trim();
    this.router.navigate(['/search'], {
      queryParams: value ? { q: value } : {},
    });
  }
}
