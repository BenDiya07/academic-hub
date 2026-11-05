import { computed, Injectable, signal } from '@angular/core';
import {
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';
import type { DemoAccount } from '../demo/demo-db';

const DEMO_SESSION_KEY = 'academic-hub:demo-session';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly clientInstance: SupabaseClient | null;
  private readonly sessionSignal = signal<Session | null>(null);
  private readonly readySignal = signal(false);

  readonly configurationError: string | null;
  readonly isDemo: boolean;

  readonly session = this.sessionSignal.asReadonly();
  readonly ready = this.readySignal.asReadonly();
  readonly user = computed<User | null>(() => this.sessionSignal()?.user ?? null);
  readonly isAuthenticated = computed<boolean>(() => this.sessionSignal() !== null);

  private readonly readyPromise: Promise<void>;

  constructor() {
    this.configurationError = this.validateConfiguration();
    this.isDemo =
      environment.demoMode === true || this.configurationError !== null;

    if (this.isDemo) {
      this.clientInstance = null;
      this.restoreDemoSession();
      this.readySignal.set(true);
      this.readyPromise = Promise.resolve();
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
        this.isDemo
          ? 'Supabase is disabled while the app runs in demo mode.'
          : this.configurationError ??
              'Supabase client is not available. Check your environment configuration.'
      );
    }
    return this.clientInstance;
  }

  waitUntilReady(): Promise<void> {
    return this.readyPromise;
  }

  setDemoSession(account: DemoAccount): void {
    this.sessionSignal.set(this.createDemoSession(account));
    this.readySignal.set(true);
    this.persistDemoAccount(account);
  }

  clearDemoSession(): void {
    this.sessionSignal.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(DEMO_SESSION_KEY);
    }
  }

  private createDemoSession(account: DemoAccount): Session {
    const user = {
      id: account.id,
      email: account.email,
      user_metadata: { full_name: account.name, name: account.name },
      app_metadata: { provider: 'demo', providers: ['demo'] },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as User;

    return {
      access_token: 'demo-access-token',
      refresh_token: 'demo-refresh-token',
      token_type: 'bearer',
      expires_in: 86_400,
      expires_at: Math.floor(Date.now() / 1000) + 86_400,
      user,
    } as unknown as Session;
  }

  private restoreDemoSession(): void {
    const account = this.readDemoAccount();
    if (account) {
      this.sessionSignal.set(this.createDemoSession(account));
    }
  }

  private readDemoAccount(): DemoAccount | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(DEMO_SESSION_KEY);
      return raw ? (JSON.parse(raw) as DemoAccount) : null;
    } catch {
      return null;
    }
  }

  private persistDemoAccount(account: DemoAccount): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(account));
    } catch {
      // Ignore storage failures (private mode / quota).
    }
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
