import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthError } from '@supabase/supabase-js';

import { SupabaseService } from '../supabase/supabase.service';

export interface SignUpDetails {
  email: string;
  password: string;
  fullName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);

  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly user = this.supabase.user;
  readonly session = this.supabase.session;
  readonly isAuthenticated = this.supabase.isAuthenticated;
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly displayName = computed<string>(() => {
    const user = this.user();
    if (!user) return '';
    const meta = user.user_metadata as Record<string, unknown> | undefined;
    return (
      (meta?.['full_name'] as string | undefined) ??
      (meta?.['name'] as string | undefined) ??
      user.email ??
      ''
    );
  });

  waitUntilReady(): Promise<void> {
    return this.supabase.waitUntilReady();
  }

  async signIn(email: string, password: string): Promise<boolean> {
    return this.run(async () => {
      const { error } = await this.supabase.client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    });
  }

  async signUp(details: SignUpDetails): Promise<boolean> {
    return this.run(async () => {
      const { error } = await this.supabase.client.auth.signUp({
        email: details.email,
        password: details.password,
        options: {
          data: { full_name: details.fullName },
        },
      });
      if (error) throw error;
    });
  }

  async signInWithOAuth(provider: 'google' | 'github'): Promise<boolean> {
    return this.run(async () => {
      const { error } = await this.supabase.client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    });
  }

  async sendPasswordReset(email: string): Promise<boolean> {
    return this.run(async () => {
      const { error } = await this.supabase.client.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      );
      if (error) throw error;
    });
  }

  async updatePassword(password: string): Promise<boolean> {
    return this.run(async () => {
      const { error } = await this.supabase.client.auth.updateUser({ password });
      if (error) throw error;
    });
  }

  async updateEmail(email: string): Promise<boolean> {
    return this.run(async () => {
      const { error } = await this.supabase.client.auth.updateUser({ email });
      if (error) throw error;
    });
  }

  async signOut(): Promise<void> {
    this.errorSignal.set(null);
    await this.supabase.client.auth.signOut();
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  private async run(action: () => Promise<void>): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      await action();
      return true;
    } catch (error) {
      this.errorSignal.set(this.messageFrom(error));
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  private messageFrom(error: unknown): string {
    if (error instanceof AuthError) return error.message;
    if (error instanceof Error) return error.message;
    return 'Une erreur inattendue est survenue.';
  }
}
