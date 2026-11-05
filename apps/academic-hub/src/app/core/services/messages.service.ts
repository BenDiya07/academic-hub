import { inject, Injectable } from '@angular/core';

import type { ChatMessage, ChatUser } from '../models';
import { initials } from '../utils/format';
import { AuthService } from '../auth/auth.service';
import {
  demoListConversation,
  demoListInbox,
  demoListUsers,
  demoMarkConversationRead,
  demoSendMessage,
} from '../demo/demo-db';
import { SupabaseService } from '../supabase/supabase.service';

export type { ChatMessage, ChatUser } from '../models';

interface ProfileRow {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
}

interface MessageRow {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async listUsers(): Promise<ChatUser[]> {
    const currentId = this.requireUserId();

    if (this.supabase.isDemo) {
      return demoListUsers(currentId);
    }

    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('id, full_name, username, avatar_url, role')
      .neq('id', currentId)
      .order('full_name', { ascending: true })
      .limit(200)
      .returns<ProfileRow[]>();

    if (error) throw error;
    return (data ?? []).map((row) => this.toUser(row));
  }

  async listInbox(): Promise<ChatMessage[]> {
    const currentId = this.requireUserId();

    if (this.supabase.isDemo) {
      return demoListInbox(currentId);
    }

    const { data, error } = await this.supabase.client
      .from('messages')
      .select('id, sender_id, recipient_id, content, read, created_at')
      .or(`sender_id.eq.${currentId},recipient_id.eq.${currentId}`)
      .order('created_at', { ascending: false })
      .limit(500)
      .returns<MessageRow[]>();

    if (error) throw error;
    return (data ?? []).map((row) => this.toMessage(row));
  }

  async listConversation(userId: string): Promise<ChatMessage[]> {
    const currentId = this.requireUserId();
    if (userId === currentId) return [];

    if (this.supabase.isDemo) {
      return demoListConversation(currentId, userId);
    }

    const { data, error } = await this.supabase.client
      .from('messages')
      .select('id, sender_id, recipient_id, content, read, created_at')
      .or(
        `and(sender_id.eq.${currentId},recipient_id.eq.${userId}),` +
          `and(sender_id.eq.${userId},recipient_id.eq.${currentId})`
      )
      .order('created_at', { ascending: true })
      .returns<MessageRow[]>();

    if (error) throw error;
    return (data ?? []).map((row) => this.toMessage(row));
  }

  async send(recipientId: string, content: string): Promise<void> {
    const senderId = this.requireUserId();

    if (this.supabase.isDemo) {
      demoSendMessage(senderId, recipientId, content);
      return;
    }

    const { error } = await this.supabase.client.from('messages').insert({
      sender_id: senderId,
      recipient_id: recipientId,
      content,
    });

    if (error) throw error;
  }

  async markConversationRead(userId: string): Promise<void> {
    const currentId = this.requireUserId();

    if (this.supabase.isDemo) {
      demoMarkConversationRead(currentId, userId);
      return;
    }

    const { error } = await this.supabase.client
      .from('messages')
      .update({ read: true })
      .eq('recipient_id', currentId)
      .eq('sender_id', userId)
      .eq('read', false);

    if (error) throw error;
  }

  subscribeToMessages(onChange: () => void): () => void {
    if (this.supabase.isDemo || !this.auth.isAuthenticated()) {
      return () => undefined;
    }

    const channel = this.supabase.client
      .channel('academic-hub:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => onChange()
      )
      .subscribe();

    return () => {
      void this.supabase.client.removeChannel(channel);
    };
  }

  private toUser(row: ProfileRow): ChatUser {
    const name = row.full_name || row.username || 'Unknown member';
    return {
      id: row.id,
      name,
      initials: initials(name),
      avatarUrl: row.avatar_url,
      role: row.role,
    };
  }

  private toMessage(row: MessageRow): ChatMessage {
    return {
      id: row.id,
      senderId: row.sender_id,
      recipientId: row.recipient_id,
      content: row.content,
      read: row.read,
      createdAt: row.created_at,
    };
  }

  private requireUserId(): string {
    const id = this.auth.user()?.id;
    if (!id) {
      throw new Error('You must be signed in to use messages.');
    }
    return id;
  }
}
