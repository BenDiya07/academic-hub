import { inject, Injectable } from '@angular/core';

import type { Community } from '../models';
import { initials } from '../utils/format';
import { AuthService } from '../auth/auth.service';
import { SupabaseService } from '../supabase/supabase.service';

interface CommunityRow {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  created_at: string;
  community_members: { count: number }[] | null;
}

export interface CreateCommunityInput {
  name: string;
  description: string;
  category: string;
}

@Injectable({ providedIn: 'root' })
export class CommunitiesService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async list(): Promise<Community[]> {
    const currentId = this.auth.user()?.id ?? null;

    const { data, error } = await this.supabase.client
      .from('communities')
      .select(
        'id, name, description, category, image_url, created_at, community_members(count)'
      )
      .order('created_at', { ascending: false })
      .returns<CommunityRow[]>();

    if (error) throw error;

    const memberships = await this.myCommunityIds(currentId);
    return (data ?? []).map((row) => this.toCommunity(row, memberships));
  }

  async create(input: CreateCommunityInput): Promise<void> {
    const createdBy = this.requireUserId();

    const { data, error } = await this.supabase.client
      .from('communities')
      .insert({
        name: input.name,
        description: input.description,
        category: input.category || 'General',
        created_by: createdBy,
      })
      .select('id')
      .single<{ id: string }>();

    if (error) throw error;

    if (data) {
      await this.supabase.client
        .from('community_members')
        .insert({ community_id: data.id, user_id: createdBy, role: 'Owner' });
    }
  }

  async setJoined(communityId: string, join: boolean): Promise<void> {
    const userId = this.requireUserId();

    const { error } = join
      ? await this.supabase.client
          .from('community_members')
          .insert({ community_id: communityId, user_id: userId })
      : await this.supabase.client
          .from('community_members')
          .delete()
          .eq('community_id', communityId)
          .eq('user_id', userId);

    if (error) throw error;
  }

  private async myCommunityIds(userId: string | null): Promise<Set<string>> {
    if (!userId) return new Set();

    const { data, error } = await this.supabase.client
      .from('community_members')
      .select('community_id')
      .eq('user_id', userId)
      .returns<{ community_id: string }[]>();

    if (error) throw error;
    return new Set((data ?? []).map((row) => row.community_id));
  }

  private toCommunity(row: CommunityRow, memberships: Set<string>): Community {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      category: row.category ?? 'General',
      image: row.image_url,
      members: row.community_members?.[0]?.count ?? 0,
      joined: memberships.has(row.id),
      initials: initials(row.name),
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
