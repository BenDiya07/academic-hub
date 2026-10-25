import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { CommunitiesService } from '../../core/services/communities.service';
import { Communities } from './communities';

describe('Communities', () => {
  let component: Communities;
  let fixture: ComponentFixture<Communities>;

  const communitiesService = {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue(undefined),
    setJoined: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [Communities],
      providers: [{ provide: CommunitiesService, useValue: communitiesService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Communities);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load communities on init', () => {
    expect(communitiesService.list).toHaveBeenCalled();
    expect(component.communities()).toEqual([]);
  });

  it('allows members to leave and updates the member count', async () => {
    const community = {
      id: 'community-1',
      name: 'Research',
      description: 'Research group',
      category: 'Science',
      image: null,
      members: 4,
      joined: true,
      initials: 'RE',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    component.communities.set([community]);

    await component.toggleJoin(community);

    expect(communitiesService.setJoined).toHaveBeenCalledWith('community-1', false);
    expect(component.communities()[0]).toMatchObject({ joined: false, members: 3 });
  });

  it('restores membership state when leaving fails', async () => {
    const community = {
      id: 'community-1',
      name: 'Research',
      description: 'Research group',
      category: 'Science',
      image: null,
      members: 4,
      joined: true,
      initials: 'RE',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    communitiesService.setJoined.mockRejectedValueOnce(new Error('Network error'));
    component.communities.set([community]);

    await component.toggleJoin(community);

    expect(component.communities()[0]).toMatchObject({ joined: true, members: 4 });
    expect(component.error()).toBe('Network error');
  });
});
