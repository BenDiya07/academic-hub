import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

import type { Post } from '../../core/models';
import type { PostComment } from '../../core/services/posts.service';
import { PostsService } from '../../core/services/posts.service';
import { timeAgo } from '../../core/utils/format';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    ChipModule,
    DialogModule,
    TextareaModule,
    InputTextModule,
    AvatarModule,
    DividerModule,
  ],
  templateUrl: './feed.html',
  styleUrls: ['./feed.css'],
})
export class Feed implements OnInit {
  private readonly postsService = inject(PostsService);

  readonly timeAgo = timeAgo;

  newPostContent = signal<string>('');
  newPostTags = signal<string>('');

  posts = signal<Post[]>([]);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  error = signal<string | null>(null);
  shareStatus = signal<string | null>(null);

  commentsVisible = signal(false);
  selectedPost = signal<Post | null>(null);
  comments = signal<PostComment[]>([]);
  commentsLoading = signal(false);
  commentText = signal('');
  commentSubmitting = signal(false);
  commentError = signal<string | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.posts.set(await this.postsService.list());
    } catch (error) {
      this.error.set(this.message(error));
    } finally {
      this.loading.set(false);
    }
  }

  async createPost(): Promise<void> {
    const content = this.newPostContent().trim();
    if (!content || this.submitting()) return;

    const tags = this.newPostTags()
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.postsService.create(content, tags);
      this.newPostContent.set('');
      this.newPostTags.set('');
      await this.load();
    } catch (error) {
      this.error.set(this.message(error));
    } finally {
      this.submitting.set(false);
    }
  }

  async toggleLike(post: Post): Promise<void> {
    const liked = !post.liked;
    this.patchPost(post.id, { liked, likes: post.likes + (liked ? 1 : -1) });

    try {
      await this.postsService.setLiked(post.id, liked);
    } catch (error) {
      this.patchPost(post.id, {
        liked: post.liked,
        likes: post.likes,
      });
      this.error.set(this.message(error));
    }
  }

  openComments(post: Post): void {
    this.selectedPost.set(post);
    this.commentsVisible.set(true);
    this.commentText.set('');
    this.commentError.set(null);
    void this.loadComments(post.id);
  }

  closeComments(): void {
    this.commentsVisible.set(false);
    this.selectedPost.set(null);
    this.comments.set([]);
  }

  async addComment(): Promise<void> {
    const post = this.selectedPost();
    const content = this.commentText().trim();
    if (!post || !content || this.commentSubmitting()) return;

    this.commentSubmitting.set(true);
    this.commentError.set(null);
    try {
      await this.postsService.addComment(post.id, content);
      this.commentText.set('');
      await this.loadComments(post.id);
      await this.load();
    } catch (error) {
      this.commentError.set(this.message(error));
    } finally {
      this.commentSubmitting.set(false);
    }
  }

  async sharePost(post: Post): Promise<void> {
    const shareData = {
      title: 'Academic Hub post',
      text: post.content,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        this.shareStatus.set('Post shared.');
      } else {
        await navigator.clipboard.writeText(
          `${post.authorName} on Academic Hub:\n\n${post.content}\n\n${window.location.href}`
        );
        this.shareStatus.set('Post copied to clipboard.');
      }
    } catch {
      this.shareStatus.set('Unable to share this post.');
    }

    setTimeout(() => this.shareStatus.set(null), 3000);
  }

  private async loadComments(postId: string): Promise<void> {
    this.commentsLoading.set(true);
    try {
      this.comments.set(await this.postsService.listComments(postId));
    } catch (error) {
      this.commentError.set(this.message(error));
    } finally {
      this.commentsLoading.set(false);
    }
  }

  private patchPost(id: string, patch: Partial<Post>): void {
    this.posts.update((list) =>
      list.map((post) => (post.id === id ? { ...post, ...patch } : post))
    );
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'An unexpected error occurred.';
  }
}
