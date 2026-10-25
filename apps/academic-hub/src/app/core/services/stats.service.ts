import { inject, Injectable } from '@angular/core';

import type { DashboardStats } from '../models';
import { SupabaseService } from '../supabase/supabase.service';

type CountableTable = 'profiles' | 'communities' | 'projects' | 'discussions';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly supabase = inject(SupabaseService);

  async counts(): Promise<DashboardStats> {
    const [students, communities, projects, discussions] = await Promise.all([
      this.count('profiles'),
      this.count('communities'),
      this.count('projects'),
      this.count('discussions'),
    ]);

    return { students, communities, projects, discussions };
  }

  private async count(table: CountableTable): Promise<number> {
    const { count, error } = await this.supabase.client
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count ?? 0;
  }
}
