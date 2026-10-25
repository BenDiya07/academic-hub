import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [ProgressSpinnerModule],
  template: `
    <div class="callback-wrapper">
      <p-progressSpinner strokeWidth="4" ariaLabel="Signing you in"></p-progressSpinner>
      <p>Signing you in…</p>
    </div>
  `,
  styles: [
    `
      .callback-wrapper {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        color: #64748b;
      }
    `,
  ],
})
export class AuthCallback implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly done = signal(false);

  async ngOnInit(): Promise<void> {
    await this.auth.waitUntilReady();

    if (!this.done()) {
      this.done.set(true);
      this.router.navigateByUrl(this.auth.isAuthenticated() ? '/' : '/login');
    }
  }
}
