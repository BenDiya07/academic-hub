import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

interface Post {
  id: number;
  user: string;
  avatar: string;
  time: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  liked: boolean;
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    ChipModule,
    TextareaModule,
    InputTextModule,
    AvatarModule,
    DividerModule,
  ],
  templateUrl: './feed.html',
  styleUrls: ['./feed.css'],
})
export class Feed {
  newPostContent = signal<string>('');
  newPostTags = signal<string>('');

  posts = signal<Post[]>([
    {
      id: 1,
      user: 'Jean Kabila',
      avatar: '👨‍💻',
      time: '2 hours ago',
      content: 'Just finished my AI project using Angular + TensorFlow. Super excited to share it soon 🚀',
      tags: ['AI', 'Angular', 'MachineLearning'],
      likes: 45,
      comments: 8,
      liked: false,
    },
    {
      id: 2,
      user: 'Amina Diallo',
      avatar: '👩‍💼',
      time: '5 hours ago',
      content: 'Looking for collaborators on a Smart Campus project using AWS serverless architecture. Who is interested?',
      tags: ['AWS', 'Cloud', 'Serverless'],
      likes: 32,
      comments: 12,
      liked: false,
    },
    {
      id: 3,
      user: 'Mohamed Hassan',
      avatar: '👨‍🎓',
      time: '1 day ago',
      content: 'Just launched my portfolio built with Angular and Tailwind CSS. Check it out and let me know your thoughts!',
      tags: ['Design', 'Angular', 'Portfolio'],
      likes: 78,
      comments: 24,
      liked: false,
    },
  ]);

  createPost(): void {
    const content = this.newPostContent().trim();
    if (!content) return;

    const tags = this.newPostTags()
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean);

    const newPost: Post = {
      id: Date.now(),
      user: 'You',
      avatar: '👤',
      time: 'just now',
      content,
      tags: tags.length > 0 ? tags : ['General'],
      likes: 0,
      comments: 0,
      liked: false,
    };

    this.posts.update(posts => [newPost, ...posts]);
    this.newPostContent.set('');
    this.newPostTags.set('');
  }

  toggleLike(postId: number): void {
    this.posts.update((posts: Post[]) =>
      posts.map((post: Post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  }
}