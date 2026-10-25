import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentEmail = computed(() => this.auth.user()?.email ?? '');
  readonly displayName = this.auth.displayName;

  newEmail = signal('');
  password = signal('');
  passwordConfirmation = signal('');

  savingEmail = signal(false);
  savingPassword = signal(false);
  signingOut = signal(false);

  emailError = signal<string | null>(null);
  emailSuccess = signal<string | null>(null);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);

  async updateEmail(): Promise<void> {
    const email = this.newEmail().trim().toLowerCase();
    this.emailError.set(null);
    this.emailSuccess.set(null);

    if (!email) {
      this.emailError.set('Please enter a new email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.emailError.set('Please enter a valid email address.');
      return;
    }

    if (email === this.currentEmail().toLowerCase()) {
      this.emailError.set('This is already your current email address.');
      return;
    }

    this.savingEmail.set(true);
    const ok = await this.auth.updateEmail(email);
    this.savingEmail.set(false);

    if (ok) {
      this.newEmail.set('');
      this.emailSuccess.set(
        'Confirmation link sent. Check both your old and new inbox to complete the change.'
      );
    } else {
      this.emailError.set(this.auth.error() ?? 'Unable to update your email.');
    }
  }

  async updatePassword(): Promise<void> {
    const password = this.password();
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    if (password.length < 6) {
      this.passwordError.set('Your password must contain at least 6 characters.');
      return;
    }

    if (password !== this.passwordConfirmation()) {
      this.passwordError.set('The passwords do not match.');
      return;
    }

    this.savingPassword.set(true);
    const ok = await this.auth.updatePassword(password);
    this.savingPassword.set(false);

    if (ok) {
      this.password.set('');
      this.passwordConfirmation.set('');
      this.passwordSuccess.set('Your password has been updated.');
    } else {
      this.passwordError.set(this.auth.error() ?? 'Unable to update your password.');
    }
  }

  async signOut(): Promise<void> {
    if (this.signingOut()) return;
    this.signingOut.set(true);
    try {
      await this.auth.signOut();
      await this.router.navigateByUrl('/login');
    } finally {
      this.signingOut.set(false);
    }
  }
}
