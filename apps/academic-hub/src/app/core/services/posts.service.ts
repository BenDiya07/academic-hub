import { inject, Injectable } from '@angular/core';

import type { Post } from '../models';
import { initials } from '../utils/format';
import { AuthService } from '../auth/auth.service';
import { SupabaseService } from '../supabase/supabase.service';

interface ProfileLite {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface PostRow {
  id: string;
  author_id: string;
  content: string;
  tags: string[] | null;
  created_at: string;
  author: ProfileLite | null;
  post_likes: { user_id: string }[] | null;
  post_comments: { count: number }[] | null;
}

interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author: ProfileLite | null;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  content: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async list(): Promise<Post[]> {
    const currentId = this.auth.user()?.id ?? null;

    const { data, error } = await this.supabase.client
      .from('posts')
      .select(
        `id, author_id, content, tags, created_at,
         author:profiles!posts_author_id_fkey(id, full_name, username, avatar_url),
         post_likes(user_id),
         post_comments(count)`
      )
      .order('created_at', { ascending: false })
      .returns<PostRow[]>();

    if (error) throw error;
    return (data ?? []).map((row) => this.toPost(row, currentId));
  }

  async create(content: string, tags: string[]): Promise<void> {
    const authorId = this.requireUserId();
    const { error } = await this.supabase.client
      .from('posts')
      .insert({ author_id: authorId, content, tags });
    if (error) throw error;
  }

  async setLiked(postId: string, liked: boolean): Promise<void> {
    const userId = this.requireUserId();

    const { error } = liked
      ? await this.supabase.client
          .from('post_likes')
          .insert({ post_id: postId, user_id: userId })
      : await this.supabase.client
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

    if (error) throw error;
  }

  async remove(postId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('posts')
      .delete()
      .eq('id', postId);
    if (error) throw error;
  }

  async listComments(postId: string): Promise<PostComment[]> {
    const { data, error } = await this.supabase.client
      .from('post_comments')
      .select(
        `id, post_id, author_id, content, created_at,
         author:profiles!post_comments_author_id_fkey(id, full_name, username, avatar_url)`
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .returns<CommentRow[]>();

    if (error) throw error;
    return (data ?? []).map((row) => this.toComment(row));
  }

  async addComment(postId: string, content: string): Promise<void> {
    const authorId = this.requireUserId();
    const { error } = await this.supabase.client
      .from('post_comments')
      .insert({ post_id: postId, author_id: authorId, content });

    if (error) throw error;
  }

  private toPost(row: PostRow, currentId: string | null): Post {
    const likes = row.post_likes ?? [];
    const commentCount = row.post_comments?.[0]?.count ?? 0;
    const name = row.author?.full_name || row.author?.username || 'Unknown';

    return {
      id: row.id,
      authorId: row.author_id,
      content: row.content,
      tags: row.tags ?? [],
      createdAt: row.created_at,
      authorName: name,
      authorInitials: initials(name),
      likes: likes.length,
      comments: commentCount,
      liked: currentId !== null && likes.some((like) => like.user_id === currentId),
    };
  }

  private toComment(row: CommentRow): PostComment {
    const name = row.author?.full_name || row.author?.username || 'Unknown';
    return {
      id: row.id,
      postId: row.post_id,
      authorId: row.author_id,
      authorName: name,
      authorInitials: initials(name),
      content: row.content,
      createdAt: row.created_at,
    };
  }

  private requireUserId(): string {
    const id = this.auth.user()?.id;
    if (!id) {
      throw new Error('You must be signed in to perform this action.');
    }
    return id;
  }
}
