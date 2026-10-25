import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    PasswordModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  fullName = signal('');
  email = signal('');
  password = signal('');
  confirmationSent = signal(false);

  get loading(): boolean {
    return this.auth.loading();
  }

  get error(): string | null {
    return this.auth.error();
  }

  async submit(): Promise<void> {
    const ok = await this.auth.signUp({
      email: this.email().trim(),
      password: this.password(),
      fullName: this.fullName().trim(),
    });

    if (!ok) {
      return;
    }

    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/');
    } else {
      this.confirmationSent.set(true);
    }
  }

  async signInWith(provider: 'google' | 'github'): Promise<void> {
    await this.auth.signInWithOAuth(provider);
  }
}
