import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  template: `
    <div class="not-found">
      <span class="code">404</span>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <div class="actions">
        <p-button label="Back to dashboard" icon="pi pi-home" routerLink="/"></p-button>
        <p-button
          label="Explore projects"
          icon="pi pi-briefcase"
          severity="secondary"
          [outlined]="true"
          routerLink="/projects">
        </p-button>
      </div>
    </div>
  `,
  styles: [
    `
      .not-found {
        min-height: 60vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 3rem 1.5rem;
      }

      .code {
        font-size: 5rem;
        font-weight: 800;
        line-height: 1;
        color: #c7d2fe;
      }

      h1 {
        margin: 1rem 0 0.5rem;
        font-size: 1.8rem;
        color: #0f172a;
      }

      p {
        margin: 0 0 1.5rem;
        color: #64748b;
        max-width: 420px;
      }

      .actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        justify-content: center;
      }
    `,
  ],
})
export class NotFound {}
