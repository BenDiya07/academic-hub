import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';

import { AuthService } from '../../core/auth/auth.service';
import type { Profile as UserProfile } from '../../core/models';
import { ProfileService } from '../../core/services/profile.service';
import { initials } from '../../core/utils/format';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AvatarModule,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    MessageModule,
    TextareaModule,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);

  readonly email = computed(() => this.auth.user()?.email ?? '');
  readonly displayName = this.auth.displayName;

  profile = signal<UserProfile | null>(null);
  loading = signal(false);
  saving = signal(false);
  editing = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  username = signal('');
  fullName = signal('');
  role = signal('');
  department = signal('');
  bio = signal('');
  location = signal('');

  readonly initials = computed(() =>
    initials(this.profile()?.fullName ?? this.displayName())
  );

  readonly memberSince = computed(() => {
    const createdAt = this.profile()?.createdAt;
    if (!createdAt) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(createdAt));
  });

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const profile = await this.profileService.getCurrent();
      this.profile.set(profile);
      if (profile) {
        this.populateForm(profile);
      }
    } catch (error) {
      this.error.set(this.message(error));
    } finally {
      this.loading.set(false);
    }
  }

  startEditing(): void {
    const profile = this.profile();
    if (profile) {
      this.populateForm(profile);
    }
    this.success.set(null);
    this.error.set(null);
    this.editing.set(true);
  }

  cancelEditing(): void {
    const profile = this.profile();
    if (profile) {
      this.populateForm(profile);
    }
    this.editing.set(false);
    this.success.set(null);
    this.error.set(null);
  }

  async save(): Promise<void> {
    if (this.saving()) return;

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      await this.profileService.update({
        username: this.username().trim() || null,
        fullName: this.fullName().trim() || null,
        role: this.role().trim() || null,
        department: this.department().trim() || null,
        bio: this.bio().trim() || null,
        location: this.location().trim() || null,
      });
      this.editing.set(false);
      this.success.set('Your profile has been updated.');
      await this.load();
    } catch (error) {
      this.error.set(this.message(error));
    } finally {
      this.saving.set(false);
    }
  }

  private populateForm(profile: UserProfile): void {
    this.username.set(profile.username ?? '');
    this.fullName.set(profile.fullName ?? '');
    this.role.set(profile.role ?? '');
    this.department.set(profile.department ?? '');
    this.bio.set(profile.bio ?? '');
    this.location.set(profile.location ?? '');
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'An unexpected error occurred.';
  }
}
