import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

import type { Community } from '../../core/models';
import { CommunitiesService } from '../../core/services/communities.service';

interface Stat {
  label: string;
  value: number;
  icon: string;
}

@Component({
  selector: 'app-communities',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AvatarModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
  ],
  templateUrl: './communities.html',
  styleUrl: './communities.css',
})
export class Communities implements OnInit {
  private readonly communitiesService = inject(CommunitiesService);

  // UI state
  showCreateDialog = signal(false);
  searchText = signal('');
  selectedCategory = signal('All');
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);
  joiningCommunityIds = signal<ReadonlySet<string>>(new Set());

  newCommunityName = signal('');
  newCommunityDescription = signal('');
  newCommunityCategory = signal('');

  communities = signal<Community[]>([]);

  readonly stats = computed<Stat[]>(() => {
    const list = this.communities();
    return [
      { label: 'Members', value: list.reduce((sum, c) => sum + c.members, 0), icon: 'pi pi-users' },
      { label: 'Communities', value: list.length, icon: 'pi pi-building' },
      { label: 'Joined', value: list.filter((c) => c.joined).length, icon: 'pi pi-check-circle' },
      {
        label: 'Categories',
        value: new Set(list.map((c) => c.category)).size,
        icon: 'pi pi-tags',
      },
    ];
  });

  readonly categories = computed<string[]>(() => {
    const set = new Set(this.communities().map((c) => c.category));
    return ['All', ...Array.from(set).sort()];
  });

  readonly categoryCounts = computed(() => {
    const counts = new Map<string, number>();
    for (const community of this.communities()) {
      counts.set(community.category, (counts.get(community.category) ?? 0) + 1);
    }
    return Array.from(counts, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    );
  });

  readonly filteredCommunities = computed<Community[]>(() => {
    const search = this.searchText().toLowerCase().trim();
    const category = this.selectedCategory();

    return this.communities().filter((community) => {
      const matchesSearch =
        !search ||
        community.name.toLowerCase().includes(search) ||
        community.description.toLowerCase().includes(search) ||
        community.category.toLowerCase().includes(search);
      const matchesCategory = category === 'All' || community.category === category;
      return matchesSearch && matchesCategory;
    });
  });

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.communities.set(await this.communitiesService.list());
    } catch (error) {
      this.error.set(this.message(error));
    } finally {
      this.loading.set(false);
    }
  }

  scrollToCommunities(): void {
    document
      .getElementById('communities-list')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
    this.scrollToCommunities();
  }

  async toggleJoin(community: Community): Promise<void> {
    if (this.joiningCommunityIds().has(community.id)) return;

    const join = !community.joined;
    this.error.set(null);
    this.joiningCommunityIds.update((ids) => new Set(ids).add(community.id));
    this.patchCommunity(community.id, {
      joined: join,
      members: community.members + (join ? 1 : -1),
    });

    try {
      await this.communitiesService.setJoined(community.id, join);
    } catch (error) {
      this.patchCommunity(community.id, {
        joined: community.joined,
        members: community.members,
      });
      this.error.set(this.message(error));
    } finally {
      this.joiningCommunityIds.update((ids) => {
        const next = new Set(ids);
        next.delete(community.id);
        return next;
      });
    }
  }

  isJoining(communityId: string): boolean {
    return this.joiningCommunityIds().has(communityId);
  }

  async createCommunity(): Promise<void> {
    const name = this.newCommunityName().trim();
    if (!name || this.submitting()) return;

    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.communitiesService.create({
        name,
        description: this.newCommunityDescription().trim(),
        category: this.newCommunityCategory(),
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

  private resetForm(): void {
    this.newCommunityName.set('');
    this.newCommunityDescription.set('');
    this.newCommunityCategory.set('');
  }

  private patchCommunity(id: string, patch: Partial<Community>): void {
    this.communities.update((list) =>
      list.map((community) => (community.id === id ? { ...community, ...patch } : community))
    );
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'An unexpected error occurred.';
  }
}
