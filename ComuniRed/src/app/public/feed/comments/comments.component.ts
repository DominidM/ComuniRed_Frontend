import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Queja, Usuario } from '../../../services/queja.service';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent {
  @Input() post!: Queja;
  @Input() currentUser: { id?: string; name: string; avatarUrl: string } | null = null;
  @Input() commentText: string = '';
  @Input() editingCommentId: string | null = null;
  @Input() editingCommentText: string = '';
  @Input() showCommentMenuModal: { [id: string]: boolean } = {};

  @Output() commentAdded      = new EventEmitter<{ post: Queja; text: string }>();
  @Output() commentTextChange = new EventEmitter<string>();
  @Output() openModal         = new EventEmitter<void>();
  @Output() startEdit         = new EventEmitter<any>();
  @Output() saveEdit          = new EventEmitter<void>();
  @Output() cancelEdit        = new EventEmitter<void>();
  @Output() deleteComment     = new EventEmitter<{ post: Queja; commentId: string }>();
  @Output() menuToggle        = new EventEmitter<{ commentId: string }>();
  @Output() profileClicked    = new EventEmitter<Usuario>();

  getPreviewComments(): any[] { return (this.post.comments || []).slice(0, 3); }
  hasMoreComments(): boolean  { return (this.post.comments || []).length > 3; }
  getCommentsCount(): number  { return this.post.commentsCount || (this.post.comments || []).length; }
  canEditComment(c: any): boolean { return c.author?.id === this.currentUser?.id; }

  getAuthor(c: any): string {
    return `${c.author?.nombre || ''} ${c.author?.apellido || ''}`.trim() || 'Usuario';
  }

  formatDate(d: string): string {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return 'justo ahora';
    if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
    if (s < 86400) return `hace ${Math.floor(s / 3600)}h`;
    return `hace ${Math.floor(s / 86400)} días`;
  }
}