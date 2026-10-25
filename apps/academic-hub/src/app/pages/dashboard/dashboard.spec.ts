import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { CommunitiesService } from '../../core/services/communities.service';
import { PostsService } from '../../core/services/posts.service';
import { ProjectsService } from '../../core/services/projects.service';
import { StatsService } from '../../core/services/stats.service';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        {
          provide: StatsService,
          useValue: {
            counts: vi.fn().mockResolvedValue({
              students: 0,
              communities: 0,
              projects: 0,
              discussions: 0,
            }),
          },
        },
        { provide: ProjectsService, useValue: { list: vi.fn().mockResolvedValue([]) } },
        { provide: CommunitiesService, useValue: { list: vi.fn().mockResolvedValue([]) } },
        { provide: PostsService, useValue: { list: vi.fn().mockResolvedValue([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    expect(component.stats()).toEqual({
      students: 0,
      communities: 0,
      projects: 0,
      discussions: 0,
    });
  });
});
