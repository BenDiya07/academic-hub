import { computed, Injectable, signal } from '@angular/core';
import {
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly clientInstance: SupabaseClient | null;
  private readonly sessionSignal = signal<Session | null>(null);
  private readonly readySignal = signal(false);

  readonly configurationError: string | null = this.validateConfiguration();

  readonly session = this.sessionSignal.asReadonly();
  readonly ready = this.readySignal.asReadonly();
  readonly user = computed<User | null>(() => this.sessionSignal()?.user ?? null);
  readonly isAuthenticated = computed<boolean>(() => this.sessionSignal() !== null);

  private readonly readyPromise: Promise<void>;

  constructor() {
    if (this.configurationError) {
      this.clientInstance = null;
      this.readySignal.set(true);
      this.readyPromise = Promise.resolve();
      console.warn(`[SupabaseService] ${this.configurationError}`);
      return;
    }

    this.clientInstance = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );

    this.readyPromise = this.clientInstance.auth
      .getSession()
      .then(({ data }) => {
        this.sessionSignal.set(data.session);
      })
      .catch((error: unknown) => {
        console.error('[SupabaseService] Failed to restore session', error);
      })
      .finally(() => {
        this.readySignal.set(true);
      });

    this.clientInstance.auth.onAuthStateChange((_event, session) => {
      this.sessionSignal.set(session);
      this.readySignal.set(true);
    });
  }

  get client(): SupabaseClient {
    if (!this.clientInstance) {
      throw new Error(
        this.configurationError ??
          'Supabase client is not available. Check your environment configuration.'
      );
    }
    return this.clientInstance;
  }

  waitUntilReady(): Promise<void> {
    return this.readyPromise;
  }

  private validateConfiguration(): string | null {
    const { supabaseUrl, supabaseAnonKey } = environment;

    const isHttpUrl = /^https?:\/\/.+/i.test(supabaseUrl);
    if (!isHttpUrl || supabaseUrl.includes('YOUR_')) {
      return 'Supabase URL is missing or invalid. Set supabaseUrl in src/environments/environment.ts.';
    }

    if (!supabaseAnonKey || supabaseAnonKey.includes('YOUR_')) {
      return 'Supabase anon key is missing. Set supabaseAnonKey in src/environments/environment.ts.';
    }

    return null;
  }
}
