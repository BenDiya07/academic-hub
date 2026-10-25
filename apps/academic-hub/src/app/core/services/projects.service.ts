import { inject, Injectable } from '@angular/core';

import type { Project, ProjectDetail, ProjectStatus } from '../models';
import { initials } from '../utils/format';
import { AuthService } from '../auth/auth.service';
import { SupabaseService } from '../supabase/supabase.service';

interface OwnerLite {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
}

interface ProjectRow {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  status: ProjectStatus;
  progress: number;
  category: string | null;
  image_url: string | null;
  technologies: string[] | null;
  views: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  owner: OwnerLite | null;
  project_members: { count: number }[] | null;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  technologies: string[];
}

const PROJECT_SELECT = `id, title, description, owner_id, status, progress, category,
  image_url, technologies, views, start_date, end_date, created_at,
  owner:profiles!projects_owner_id_fkey(id, full_name, username, avatar_url, role),
  project_members(count)`;

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async list(): Promise<Project[]> {
    const currentId = this.auth.user()?.id ?? null;

    const { data, error } = await this.supabase.client
      .from('projects')
      .select(PROJECT_SELECT)
      .order('created_at', { ascending: false })
      .returns<ProjectRow[]>();

    if (error) throw error;

    const memberships = await this.myProjectIds(currentId);
    return (data ?? []).map((row) => this.toProject(row, memberships, currentId));
  }

  async getById(id: string): Promise<ProjectDetail | null> {
    const currentId = this.auth.user()?.id ?? null;

    const { data, error } = await this.supabase.client
      .from('projects')
      .select(PROJECT_SELECT)
      .eq('id', id)
      .maybeSingle<ProjectRow>();

    if (error) throw error;
    if (!data) return null;

    const memberships = await this.myProjectIds(currentId);
    const base = this.toProject(data, memberships, currentId);

    return {
      ...base,
      ownerRole: data.owner?.role ?? 'Member',
      startDate: data.start_date,
      endDate: data.end_date,
    };
  }

  async create(input: CreateProjectInput): Promise<void> {
    const ownerId = this.requireUserId();

    const { data, error } = await this.supabase.client
      .from('projects')
      .insert({
        title: input.title,
        description: input.description,
        owner_id: ownerId,
        technologies: input.technologies,
        status: 'Planning',
      })
      .select('id')
      .single<{ id: string }>();

    if (error) throw error;

    if (data) {
      await this.supabase.client
        .from('project_members')
        .insert({ project_id: data.id, user_id: ownerId, role: 'Owner' });
    }
  }

  async setMembership(projectId: string, join: boolean): Promise<void> {
    const userId = this.requireUserId();

    const { error } = join
      ? await this.supabase.client
          .from('project_members')
          .insert({ project_id: projectId, user_id: userId })
      : await this.supabase.client
          .from('project_members')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', userId);

    if (error) throw error;
  }

  private async myProjectIds(userId: string | null): Promise<Set<string>> {
    if (!userId) return new Set();

    const { data, error } = await this.supabase.client
      .from('project_members')
      .select('project_id')
      .eq('user_id', userId)
      .returns<{ project_id: string }[]>();

    if (error) throw error;
    return new Set((data ?? []).map((row) => row.project_id));
  }

  private toProject(
    row: ProjectRow,
    memberships: Set<string>,
    currentId: string | null
  ): Project {
    const name = row.owner?.full_name || row.owner?.username || 'Unknown';

    return {
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      status: row.status,
      progress: row.progress,
      category: row.category ?? 'General',
      image: row.image_url,
      technologies: row.technologies ?? [],
      views: row.views,
      membersCount: row.project_members?.[0]?.count ?? 0,
      ownerId: row.owner_id,
      ownerName: name,
      ownerInitials: initials(name),
      isMember: currentId !== null && memberships.has(row.id),
      createdAt: row.created_at,
    };
  }

  private requireUserId(): string {
    const id = this.auth.user()?.id;
    if (!id) {
      throw new Error('You must be signed in to perform this action.');
    }
    return id;
  }
}
