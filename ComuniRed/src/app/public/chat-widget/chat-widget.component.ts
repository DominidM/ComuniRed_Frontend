import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';

interface Conversation {
  id: string;
  name: string;
  initials?: string;
  avatarUrl?: string;
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatBadgeModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css']
})
export class ChatWidgetComponent {
  panelOpen = false;
  expanded = false;
  query = '';
  activeConversation: Conversation | null = null;

  conversations: Conversation[] = [
    { id: 'c1', name: 'Ana García', initials: 'AG', lastMessage: 'Hola, vi tu reporte sobre el bache en la calle...', time: '01:10 a.m.', unread: 2, online: true },
    { id: 'c2', name: 'Carlos Mendoza', initials: 'CM', lastMessage: 'Gracias por apoyar mi reporte', time: '12:10 a.m.', unread: 0, online: true },
    { id: 'c3', name: 'María López', initials: 'ML', lastMessage: 'Tenemos el mismo problema en mi colonia', time: '11:10 p.m.', unread: 1, online: false },
    { id: 'c4', name: 'Pedro Sánchez', initials: 'PS', lastMessage: '¿Ya te resolvieron el problema?', time: '01:10 a.m.', unread: 0, online: false }
  ];

  get totalUnread(): number {
    return this.conversations.reduce((s, c) => s + (c.unread || 0), 0);
  }

  togglePanel() {
    this.panelOpen = !this.panelOpen;
    if (!this.panelOpen) this.activeConversation = null;
  }

  openConversation(conv: Conversation) {
    this.activeConversation = conv;
    conv.unread = 0;
  }

  closePanel() {
    this.panelOpen = false;
    this.activeConversation = null;
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  filteredConversations(): Conversation[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.conversations;
    return this.conversations.filter(c =>
      c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q)
    );
  }

  sendMessage(conv: Conversation, textEl: HTMLInputElement) {
    const txt = (textEl.value || '').trim();
    if (!txt) return;
    conv.lastMessage = txt;
    conv.time = 'Ahora';
    textEl.value = '';
    this.conversations = [conv, ...this.conversations.filter(c => c.id !== conv.id)];
  }
}