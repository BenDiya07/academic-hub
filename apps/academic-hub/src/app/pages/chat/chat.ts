import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

import { AuthService } from '../../core/auth/auth.service';
import type { ChatMessage, ChatUser } from '../../core/services/messages.service';
import { MessagesService } from '../../core/services/messages.service';
import { timeAgo } from '../../core/utils/format';

interface Conversation {
  user: ChatUser;
  lastMessage: ChatMessage | null;
  unread: number;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AvatarModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  private readonly messagesService = inject(MessagesService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly thread = viewChild<ElementRef<HTMLDivElement>>('thread');

  readonly timeAgo = timeAgo;
  readonly currentUserId = computed(() => this.auth.user()?.id ?? '');

  users = signal<ChatUser[]>([]);
  inbox = signal<ChatMessage[]>([]);
  messages = signal<ChatMessage[]>([]);
  selectedUser = signal<ChatUser | null>(null);

  searchText = signal('');
  messageText = signal('');

  loadingUsers = signal(false);
  loadingMessages = signal(false);
  sending = signal(false);
  error = signal<string | null>(null);

  private unsubscribeRealtime: (() => void) | null = null;

  readonly conversations = computed<Conversation[]>(() => {
    const currentId = this.currentUserId();
    const summaries = new Map<string, { lastMessage: ChatMessage | null; unread: number }>();

    for (const message of this.inbox()) {
      const otherId =
        message.senderId === currentId ? message.recipientId : message.senderId;
      const entry = summaries.get(otherId) ?? { lastMessage: null, unread: 0 };

      if (!entry.lastMessage) {
        entry.lastMessage = message;
      }
      if (!message.read && message.recipientId === currentId) {
        entry.unread += 1;
      }
      summaries.set(otherId, entry);
    }

    return this.users()
      .map((user) => {
        const summary = summaries.get(user.id);
        return {
          user,
          lastMessage: summary?.lastMessage ?? null,
          unread: summary?.unread ?? 0,
        };
      })
      .sort((a, b) => {
        const aDate = a.lastMessage?.createdAt ?? '';
        const bDate = b.lastMessage?.createdAt ?? '';
        if (aDate && bDate) return bDate.localeCompare(aDate);
        if (aDate) return -1;
        if (bDate) return 1;
        return a.user.name.localeCompare(b.user.name);
      });
  });

  readonly filteredConversations = computed<Conversation[]>(() => {
    const term = this.searchText().toLowerCase().trim();
    if (!term) return this.conversations();

    return this.conversations().filter(
      (conversation) =>
        conversation.user.name.toLowerCase().includes(term) ||
        (conversation.lastMessage?.content.toLowerCase().includes(term) ?? false)
    );
  });

  readonly unreadTotal = computed(() =>
    this.conversations().reduce((total, conversation) => total + conversation.unread, 0)
  );

  ngOnInit(): void {
    void this.initialize();
    this.unsubscribeRealtime = this.messagesService.subscribeToMessages(() => {
      void this.refresh();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeRealtime?.();
  }

  private async initialize(): Promise<void> {
    await this.load();
    const requestedUserId = this.route.snapshot.queryParamMap.get('user');
    if (!requestedUserId) return;
    const user = this.users().find((candidate) => candidate.id === requestedUserId);
    if (user) {
      await this.selectUser(user);
    }
  }

  async load(): Promise<void> {
    this.loadingUsers.set(true);
    this.error.set(null);
    try {
      const [users, inbox] = await Promise.all([
        this.messagesService.listUsers(),
        this.messagesService.listInbox(),
      ]);
      this.users.set(users);
      this.inbox.set(inbox);
    } catch (error) {
      this.error.set(this.message(error));
    } finally {
      this.loadingUsers.set(false);
    }
  }

  async selectUser(user: ChatUser): Promise<void> {
    this.selectedUser.set(user);
    this.searchText.set('');
    this.messageText.set('');
    this.loadingMessages.set(true);
    this.error.set(null);

    try {
      this.messages.set(await this.messagesService.listConversation(user.id));
      await this.markRead(user.id);
      this.scrollToBottom();
    } catch (error) {
      this.error.set(this.message(error));
    } finally {
      this.loadingMessages.set(false);
    }
  }

  async sendMessage(): Promise<void> {
    const user = this.selectedUser();
    const content = this.messageText().trim();
    if (!user || !content || this.sending()) return;

    this.sending.set(true);
    this.error.set(null);
    try {
      await this.messagesService.send(user.id, content);
      this.messageText.set('');
      this.messages.set(await this.messagesService.listConversation(user.id));
      this.inbox.set(await this.messagesService.listInbox());
      this.scrollToBottom();
    } catch (error) {
      this.error.set(this.message(error));
    } finally {
      this.sending.set(false);
    }
  }

  isMine(message: ChatMessage): boolean {
    return message.senderId === this.currentUserId();
  }

  onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey) return;
    keyboardEvent.preventDefault();
    void this.sendMessage();
  }

  private async refresh(): Promise<void> {
    try {
      this.inbox.set(await this.messagesService.listInbox());
      const selected = this.selectedUser();
      if (selected) {
        this.messages.set(await this.messagesService.listConversation(selected.id));
        await this.markRead(selected.id);
        this.scrollToBottom();
      }
    } catch (error) {
      this.error.set(this.message(error));
    }
  }

  private async markRead(userId: string): Promise<void> {
    await this.messagesService.markConversationRead(userId);
    const currentId = this.currentUserId();
    this.inbox.update((list) =>
      list.map((message) =>
        message.senderId === userId && message.recipientId === currentId && !message.read
          ? { ...message, read: true }
          : message
      )
    );
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const element = this.thread()?.nativeElement;
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    });
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'An unexpected error occurred.';
  }
}
