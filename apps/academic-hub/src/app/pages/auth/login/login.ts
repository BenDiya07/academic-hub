import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.html',
  styleUrl: '../auth.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = signal('');
  password = signal('');

  readonly demoMode = this.auth.isDemo;

  constructor() {
    if (this.auth.isDemo) {
      this.email.set('demo@academic-hub.app');
      this.password.set('demo1234');
    }
  }

  get loading(): boolean {
    return this.auth.loading();
  }

  get error(): string | null {
    return this.auth.error();
  }

  async submit(): Promise<void> {
    const ok = await this.auth.signIn(this.email().trim(), this.password());
    if (ok) {
      this.redirectAfter();
    }
  }

  async signInWith(provider: 'google' | 'github'): Promise<void> {
    const ok = await this.auth.signInWithOAuth(provider);
    if (ok && this.auth.isAuthenticated()) {
      this.redirectAfter();
    }
  }

  private redirectAfter(): void {
    const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
    this.router.navigateByUrl(redirectTo || '/');
  }
}
