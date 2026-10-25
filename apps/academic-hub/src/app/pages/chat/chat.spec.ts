import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from '../../core/auth/auth.service';
import { MessagesService } from '../../core/services/messages.service';
import { Chat } from './chat';

describe('Chat', () => {
  let component: Chat;
  let fixture: ComponentFixture<Chat>;

  const messagesService = {
    listUsers: vi.fn().mockResolvedValue([]),
    listInbox: vi.fn().mockResolvedValue([]),
    listConversation: vi.fn().mockResolvedValue([]),
    markConversationRead: vi.fn().mockResolvedValue(undefined),
    send: vi.fn().mockResolvedValue(undefined),
    subscribeToMessages: vi.fn().mockReturnValue(() => undefined),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chat],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { user: signal({ id: 'user-1', email: 'test@example.com' }) },
        },
        { provide: MessagesService, useValue: messagesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Chat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users and conversations on init', () => {
    expect(messagesService.listUsers).toHaveBeenCalled();
    expect(messagesService.listInbox).toHaveBeenCalled();
  });
});
