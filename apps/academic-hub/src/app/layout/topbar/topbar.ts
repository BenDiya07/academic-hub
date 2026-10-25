import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import type { MenuItem } from 'primeng/api';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-topbar',
  imports: [
    FormsModule,
    RouterLink,
    RouterLinkActive,
    AvatarModule,
    InputTextModule,
    MenuModule,
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly displayName = this.auth.displayName;
  searchTerm = signal('');

  readonly initials = computed(() => {
    const name = this.displayName().trim();
    if (!name) return '?';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  });

  readonly menuItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user', routerLink: ['/profile'] },
    { label: 'Settings', icon: 'pi pi-cog', routerLink: ['/settings'] },
    { separator: true },
    {
      label: 'Sign out',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  submitSearch(): void {
    const term = this.searchTerm().trim();
    if (!term) return;
    void this.router.navigate(['/search'], { queryParams: { q: term } });
    this.searchTerm.set('');
  }

  private async logout(): Promise<void> {
    await this.auth.signOut();
    this.router.navigateByUrl('/login');
  }
}
