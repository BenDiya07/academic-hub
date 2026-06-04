import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Feed } from './feed';

describe('Feed', () => {
  let component: Feed;
  let fixture: ComponentFixture<Feed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Feed],
    }).compileComponents();

    fixture = TestBed.createComponent(Feed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default posts', () => {
    expect(component.posts().length).toBe(3);
  });

  it('should create a new post', () => {
    component.newPostContent.set('Test post');
    component.newPostTags.set('Test, Tag');
    component.createPost();

    expect(component.posts().length).toBe(4);
    expect(component.posts()[0].user).toBe('You');
    expect(component.posts()[0].tags).toContain('Test');
  });

  it('should toggle like on a post', () => {
    const postId = component.posts()[0].id;
    const initialLikes = component.posts()[0].likes;

    component.toggleLike(postId);
    expect(component.posts()[0].liked).toBe(true);
    expect(component.posts()[0].likes).toBe(initialLikes + 1);

    component.toggleLike(postId);
    expect(component.posts()[0].liked).toBe(false);
    expect(component.posts()[0].likes).toBe(initialLikes);
  });
});
