import {
  Component, Input, Output, EventEmitter, HostListener, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Queja, Usuario } from '../../../services/queja.service';
import { CommentsComponent } from '../comments/comments.component';
import { MapComponent } from '../../../shared/map/map.component';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule, CommentsComponent, MapComponent],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css']
})
export class PostCardComponent implements OnDestroy {
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
  @Output() openCommentsModal  = new EventEmitter<Queja>();
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

  showReactionMenu = false;
  hideTimeout: any = null;

  imagenIndex = 0;
  audioPlayer: HTMLAudioElement | null = null;
  musicaSonando = false;

  reactions = [
    { type: 'like',    icon: 'pi pi-heart',     label: 'Me gusta' },
    { type: 'love',    icon: 'pi pi-star-fill',  label: 'Me encanta' },
    { type: 'wow',     icon: 'pi pi-eye',        label: 'Me asombra' },
    { type: 'helpful', icon: 'pi pi-thumbs-up',  label: 'Util' },
    { type: 'dislike', icon: 'pi pi-thumbs-down', label: 'No me gusta' },
  ];

  onReactionHover(): void {
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    this.showReactionMenu = true;
  }

  onReactionLeave(): void {
    this.hideTimeout = setTimeout(() => {
      this.showReactionMenu = false;
    }, 300);
  }

  selectReaction(type: string, event: Event): void {
    event.stopPropagation();
    this.reactionToggled.emit({ post: this.post, type });
    this.showReactionMenu = false;
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
  }

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

  getImagenes(): string[] {
    if (this.post.imagenes_url && this.post.imagenes_url.length > 0) {
      return this.post.imagenes_url;
    }
    if (this.post.imagen_url) return [this.post.imagen_url];
    if (this.post.evidence && this.post.evidence.length > 0) {
      return this.post.evidence.map(e => e.url);
    }
    return [];
  }

  getImagenActual(): string {
    const imgs = this.getImagenes();
    return imgs[this.imagenIndex] || '';
  }

  getTotalImagenes(): number {
    return this.getImagenes().length;
  }

  siguienteImagen(event: Event): void {
    event.stopPropagation();
    if (this.imagenIndex < this.getTotalImagenes() - 1) this.imagenIndex++;
  }

  anteriorImagen(event: Event): void {
    event.stopPropagation();
    if (this.imagenIndex > 0) this.imagenIndex--;
  }

  tieneMusica(): boolean {
    return !!this.post.musica_url;
  }

  toggleMusica(event: Event): void {
    event.stopPropagation();
    if (!this.post.musica_url) return;
    if (this.musicaSonando) {
      this.detenerMusica();
    } else if (this.audioPlayer) {
      this.audioPlayer.play().then(() => this.musicaSonando = true).catch(() => {});
    } else {
      this.audioPlayer = new Audio(this.post.musica_url);
      this.audioPlayer.addEventListener('ended', () => { this.musicaSonando = false; });
      this.audioPlayer.play().then(() => this.musicaSonando = true).catch(() => {});
    }
  }

  detenerMusica(): void {
    if (this.audioPlayer) { this.audioPlayer.pause(); this.audioPlayer = null; }
    this.musicaSonando = false;
  }

  getFirstEvidenceUrl(): string {
    return this.post.evidence?.[0]?.url || this.post.imagen_url || '';
  }

  canEdit(): boolean { return this.post.usuario?.id === this.currentUser?.id; }

  canVote(): boolean {
    return !!this.post.canVote && !this.post.userVote && this.isEnVotacion();
  }

  isEnVotacion(): boolean { return this.post.estado?.clave?.toLowerCase() === 'votacion'; }
  isResuelta(): boolean   { return this.post.estado?.clave?.toLowerCase() === 'resuelto'; }
  isEnProceso(): boolean  { return ['en_proceso','asignada'].includes(this.post.estado?.clave?.toLowerCase() || ''); }
  isPendiente(): boolean  { return ['pendiente','aprobada'].includes(this.post.estado?.clave?.toLowerCase() || ''); }

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

  getBookmarkIcon(): string {
    return (this.post as any).meta?.saved ? 'pi pi-bookmark-fill' : 'pi pi-bookmark';
  }

  getBookmarkText(): string {
    return (this.post as any).meta?.saved ? 'Quitar' : 'Guardar';
  }

  getEstadoBadgeClass(): string {
    const map: { [k: string]: string } = {
      nulo: 'badge badge-secondary',    votacion: 'badge badge-primary',
      pendiente: 'badge badge-warning', aprobada: 'badge badge-success',
      asignada: 'badge badge-info',     clasificada: 'badge badge-purple',
      en_proceso: 'badge badge-info',   observado: 'badge badge-warning',
      resuelto: 'badge badge-success',  cancelado: 'badge badge-danger',
    };
    return map[this.post.estado?.clave?.toLowerCase() || ''] || 'badge badge-secondary';
  }

  getRiesgoBadgeClass(): string {
    const map: { [k: string]: string } = {
      BAJO: 'badge badge-success', MEDIO: 'badge badge-warning',
      ALTO: 'badge badge-orange',  CRITICO: 'badge badge-danger',
    };
    return map[this.post.nivel_riesgo?.toUpperCase() || ''] || 'badge badge-secondary';
  }

  getRiesgoTexto(): string {
    const map: { [k: string]: string } = {
      BAJO: 'Riesgo Bajo', MEDIO: 'Riesgo Medio',
      ALTO: 'Riesgo Alto', CRITICO: 'Crítico',
    };
    return map[this.post.nivel_riesgo?.toUpperCase() || ''] || this.post.nivel_riesgo || '';
  }

  formatDate(d: string): string {
    if (!d) return '';
    const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
    if (h < 1)  return 'hace unos minutos';
    if (h < 24) return `hace ${h} horas`;
    if (h < 48) return 'hace 1 día';
    return `hace ${Math.floor(h / 24)} días`;
  }

  ngOnDestroy(): void {
    this.detenerMusica();
  }
}
