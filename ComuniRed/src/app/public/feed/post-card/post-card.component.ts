import {
  Component, Input, Output, EventEmitter, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Queja, Usuario } from '../../../services/queja.service';
import { CommentsComponent } from '../comments/comments.component';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, CommentsComponent],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css']
})
export class PostCardComponent {
  @Input() post!: Queja;
  @Input() currentUser: { id?: string; name: string; avatarUrl: string } | null = null;
  @Input() editingCommentId: string | null = null;
  @Input() editingCommentText: string = '';
  @Input() showCommentMenuModal: { [id: string]: boolean } = {};

  @Output() reactionToggled   = new EventEmitter<{ post: Queja; type: string }>();
  @Output() reactionMenuToggle= new EventEmitter<{ postId: string; event: Event }>();
  @Output() voted             = new EventEmitter<{ post: Queja; choice: 'accept' | 'reject' }>();
  @Output() commentsToggled   = new EventEmitter<Queja>();
  @Output() commentAdded      = new EventEmitter<{ post: Queja; text: string }>();
  @Output() openCommentsModal = new EventEmitter<Queja>();
  @Output() openHistorial     = new EventEmitter<Queja>();
  @Output() editPost          = new EventEmitter<Queja>();
  @Output() deletePost        = new EventEmitter<Queja>();
  @Output() bookmarkToggled   = new EventEmitter<Queja>();
  @Output() sharePost         = new EventEmitter<Queja>();
  @Output() profileClicked    = new EventEmitter<Usuario>();
  @Output() startEditComment  = new EventEmitter<any>();
  @Output() saveEditComment   = new EventEmitter<{ post: Queja }>();
  @Output() cancelEditComment = new EventEmitter<void>();
  @Output() deleteComment     = new EventEmitter<{ post: Queja; commentId: string }>();
  @Output() commentMenuToggle = new EventEmitter<{ commentId: string }>();
  @Output() editingTextChange = new EventEmitter<string>();

  // ── Estado local del menú de reacciones ──
  showReactionMenu = false;

  reactions = [
    { type: 'like',    emoji: '❤️', label: 'Me gusta' },
    { type: 'love',    emoji: '😍', label: 'Me encanta' },
    { type: 'wow',     emoji: '😮', label: 'Me asombra' },
    { type: 'helpful', emoji: '👍', label: 'Útil' },
    { type: 'dislike', emoji: '👎', label: 'No me gusta' },
  ];

  // Cierra el menú al hacer click fuera
  @HostListener('document:click')
  onDocumentClick(): void {
    this.showReactionMenu = false;
  }

  toggleReactionMenu(event: Event): void {
    event.stopPropagation();
    this.showReactionMenu = !this.showReactionMenu;
  }

  selectReaction(type: string, event: Event): void {
    event.stopPropagation();
    this.reactionToggled.emit({ post: this.post, type });
    this.showReactionMenu = false;
  }

  // ── Helpers ──────────────────────────────────────────────────
  getAvatarUrl(): string {
    return this.post.usuario?.foto_perfil || 'assets/img/default-avatar.png';
  }

  getAuthorName(): string {
    return `${this.post.usuario?.nombre || ''} ${this.post.usuario?.apellido || ''}`.trim() || 'Usuario';
  }

  getCategoryName(): string {
    return this.post.categoria?.nombre || 'Sin categoría';
  }

  hasLocation(): boolean { return !!this.post.ubicacion; }
  hasEvidence(): boolean { return (this.post.evidence?.length ?? 0) > 0; }

  getFirstEvidenceUrl(): string {
    return this.post.evidence?.[0]?.url || this.post.imagen_url || '';
  }

  canEdit(): boolean { return this.post.usuario?.id === this.currentUser?.id; }

  canVote(): boolean {
    return !!this.post.canVote && !this.post.userVote && this.isEnVotacion();
  }

  isEnVotacion(): boolean { return this.post.estado?.clave === 'votacion'; }
  isResuelta(): boolean   { return this.post.estado?.clave === 'resuelto'; }
  isEnProceso(): boolean  { return ['en_proceso','asignada'].includes(this.post.estado?.clave || ''); }
  isPendiente(): boolean  { return ['pendiente','aprobada'].includes(this.post.estado?.clave || ''); }

  hasVotes(): boolean     { return !!this.post.votes; }
  getTotalVotes(): number { return (this.post.votes?.yes || 0) + (this.post.votes?.no || 0); }
  getYesVotes(): number   { return this.post.votes?.yes || 0; }
  getNoVotes(): number    { return this.post.votes?.no || 0; }

  getVotingProgress(): number {
    return Math.min((this.getTotalVotes() / 5) * 100, 100);
  }

  needsMoreVotes(): boolean {
    return this.getTotalVotes() < 5 && this.isEnVotacion();
  }

  getVotesNeeded(): number {
    return Math.max(5 - this.getTotalVotes(), 0);
  }

  getReactionCount(type: string): number {
    return this.post.reactions?.counts?.[type] ?? 0;
  }

  getCommentsCount(): number {
    return this.post.commentsCount || (this.post.comments || []).length;
  }

  hasHistorial(): boolean {
    return !!this.post.fecha_clasificacion || !!this.post.nivel_riesgo;
  }

  hasRiesgo(): boolean { return !!this.post.nivel_riesgo; }

  getBookmarkEmoji(): string { return (this.post as any).meta?.saved ? '🔖' : '📑'; }
  getBookmarkText(): string  { return (this.post as any).meta?.saved ? 'Quitar' : 'Guardar'; }

  getEstadoBadgeClass(): string {
    const map: { [k: string]: string } = {
      nulo: 'badge bg-secondary',    votacion: 'badge bg-primary',
      pendiente: 'badge bg-warning', aprobada: 'badge bg-success',
      asignada: 'badge bg-info',     clasificada: 'badge bg-purple',
      en_proceso: 'badge bg-info',   observado: 'badge bg-warning',
      resuelto: 'badge bg-success',  cancelado: 'badge bg-danger',
    };
    return map[this.post.estado?.clave || ''] || 'badge bg-secondary';
  }

  getRiesgoBadgeClass(): string {
    const map: { [k: string]: string } = {
      BAJO: 'badge bg-success', MEDIO: 'badge bg-warning',
      ALTO: 'badge bg-orange',  CRITICO: 'badge bg-danger',
    };
    return map[this.post.nivel_riesgo?.toUpperCase() || ''] || 'badge bg-secondary';
  }

  getRiesgoTexto(): string {
    const map: { [k: string]: string } = {
      BAJO: 'Riesgo Bajo', MEDIO: 'Riesgo Medio',
      ALTO: 'Riesgo Alto', CRITICO: '⚠️ Crítico',
    };
    return map[this.post.nivel_riesgo?.toUpperCase() || ''] || this.post.nivel_riesgo || '';
  }

  getRiesgoIcon(): string {
    const map: { [k: string]: string } = {
      BAJO: '🟢', MEDIO: '🟡', ALTO: '🟠', CRITICO: '🔴'
    };
    return map[this.post.nivel_riesgo?.toUpperCase() || ''] || '⚪';
  }

  formatDate(d: string): string {
    if (!d) return '';
    const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
    if (h < 1)  return 'hace unos minutos';
    if (h < 24) return `hace ${h} horas`;
    if (h < 48) return 'hace 1 día';
    return `hace ${Math.floor(h / 24)} días`;
  }
}