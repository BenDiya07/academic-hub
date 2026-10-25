import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { Profile } from './profile';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  const profileService = {
    getCurrent: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        {
          provide: AuthService,
          useValue: {
            user: signal({ id: 'user-1', email: 'test@example.com' }),
            displayName: () => 'Test User',
          },
        },
        { provide: ProfileService, useValue: profileService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the current profile on init', () => {
    expect(profileService.getCurrent).toHaveBeenCalled();
  });
});
