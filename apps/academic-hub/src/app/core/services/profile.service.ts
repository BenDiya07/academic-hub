import { inject, Injectable } from '@angular/core';

import type { Profile } from '../models';
import { AuthService } from '../auth/auth.service';
import { SupabaseService } from '../supabase/supabase.service';

interface ProfileRow {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  department: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
}

export interface UpdateProfileInput {
  username: string | null;
  fullName: string | null;
  role: string | null;
  department: string | null;
  bio: string | null;
  location: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async getCurrent(): Promise<Profile | null> {
    const id = this.auth.user()?.id;
    if (!id) return null;
    return this.getById(id);
  }

  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select(
        'id, username, full_name, avatar_url, role, department, bio, location, created_at'
      )
      .eq('id', id)
      .maybeSingle<ProfileRow>();

    if (error) throw error;
    return data ? this.toProfile(data) : null;
  }

  async update(input: UpdateProfileInput): Promise<void> {
    const id = this.auth.user()?.id;
    if (!id) {
      throw new Error('You must be signed in to update your profile.');
    }

    const { error } = await this.supabase.client
      .from('profiles')
      .update({
        username: input.username,
        full_name: input.fullName,
        role: input.role,
        department: input.department,
        bio: input.bio,
        location: input.location,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  }

  private toProfile(row: ProfileRow): Profile {
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
}
