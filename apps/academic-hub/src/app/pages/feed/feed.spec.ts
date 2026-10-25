import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import type { Post } from '../../core/models';
import { PostsService } from '../../core/services/posts.service';
import { Feed } from './feed';

describe('Feed', () => {
  let component: Feed;
  let fixture: ComponentFixture<Feed>;

  const post: Post = {
    id: 'post-1',
    authorId: 'user-1',
    content: 'Hello Academic Hub',
    tags: ['Test'],
    createdAt: new Date().toISOString(),
    authorName: 'Test User',
    authorInitials: 'TU',
    likes: 1,
    comments: 0,
    liked: false,
  };

  const postsService = {
    list: vi.fn().mockResolvedValue([post]),
    create: vi.fn().mockResolvedValue(undefined),
    setLiked: vi.fn().mockResolvedValue(undefined),
    listComments: vi.fn().mockResolvedValue([]),
    addComment: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [Feed],
      providers: [{ provide: PostsService, useValue: postsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Feed);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load posts on init', () => {
    expect(postsService.list).toHaveBeenCalled();
    expect(component.posts()).toEqual([post]);
  });

  it('should create a new post', async () => {
    component.newPostContent.set('Test post');
    component.newPostTags.set('Test, Tag');

    await component.createPost();

    expect(postsService.create).toHaveBeenCalledWith('Test post', ['Test', 'Tag']);
    expect(component.newPostContent()).toBe('');
    expect(component.newPostTags()).toBe('');
  });

  it('should toggle like on a post', async () => {
    const current = component.posts()[0];

    await component.toggleLike(current);

    expect(postsService.setLiked).toHaveBeenCalledWith('post-1', true);
    expect(component.posts()[0].liked).toBe(true);
    expect(component.posts()[0].likes).toBe(2);
  });
});
