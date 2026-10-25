import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { ProjectsService } from '../../core/services/projects.service';
import { Projects } from './projects';

describe('Projects', () => {
  let component: Projects;
  let fixture: ComponentFixture<Projects>;

  const projectsService = {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue(undefined),
    setMembership: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projects],
      providers: [
        provideRouter([]),
        { provide: ProjectsService, useValue: projectsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Projects);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects on init', () => {
    expect(projectsService.list).toHaveBeenCalled();
    expect(component.projects()).toEqual([]);
  });
});
