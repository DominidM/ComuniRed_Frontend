import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuejaService } from '../../services/queja.service';
import { Queja } from '../../services/models';
import { UsuarioService } from '../../services/usuario.service';
import { HttpClientModule } from '@angular/common/http';

type AnyPost = any;

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  user: { id?: string; name: string; avatarUrl: string } | null = null;
  posts: Queja[] = [];
  loading = false;
  reactionTypes = ['like', 'love', 'wow', 'helpful', 'dislike', 'report'];
  
  // Modal de crear queja
  showCreateModal = false;
  newQueja = {
    titulo: '',
    descripcion: '',
    categoria: '',
    ubicacion: '',
    imagenFile: null as File | null,
    imagenPreview: null as string | null
  };

  constructor(private quejaService: QuejaService, private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    const u = this.usuarioService.getUser();
    if (u) {
      const avatar = (u as any).foto_perfil || 'assets/img/default-avatar.png';
      this.user = { id: (u as any).id || undefined, name: (u as any).name || 'Usuario', avatarUrl: avatar };
    } else {
      this.user = { name: 'Usuario', avatarUrl: 'assets/img/default-avatar.png' };
    }

    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.quejaService.getAll().subscribe({
      next: (posts: Queja[]) => {
        this.posts = (posts || []).map(p => this.normalizePost(p));
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error cargando posts', err);
        this.loading = false;
      }
    });
  }

  private normalizePost(p: AnyPost): Queja {
    const post: AnyPost = { ...p };

    // fechas / autor
    post.fechaCreacion = post.fecha_creacion ?? post.createdAt ?? post.fechaCreacion ?? post.created_at;
    post.usuario = post.usuario ?? post.author ?? post.autor;
    post.estado = post.estado ?? post.state;

    // evidence / imagen
    post.evidence = post.evidence ?? (post.imagen_url ? [{ id: 'img-1', url: post.imagen_url, type: 'IMAGE' }] : []);
    post.imagen_url = post.imagen_url ?? (post.evidence && post.evidence[0]?.url) ?? post.imagenUrl;

    // votes structure
    post.votes = post.votes ?? {
      yes: post.yes_votes ?? post.votos_positivos ?? 0,
      no: post.no_votes ?? post.votos_negativos ?? 0,
      total: 0
    };
    post.votes.total = (post.votes.yes || 0) + (post.votes.no || 0);

    // reactions summary
    post.reactions = post.reactions ?? post.reactionSummary ?? { counts: {}, userReaction: null, total: 0 };

    // comments
    post.comments = post.comments ?? [];
    post.commentsCount = post.commentsCount ?? post.comments?.length ?? 0;

    // UI local flags
    post.showComments = !!post.showComments;
    post.meta = post.meta ?? {};
    post.canVote = (post.canVote !== undefined) ? post.canVote : this.deriveCanVote(post);
    post.userVote = post.userVote ?? post.user_vote ?? null;

    return post as Queja;
  }

  private deriveCanVote(post: AnyPost): boolean {
    try {
      if (post.userVote) return false;
      const end = post.votingEndAt ?? post.voting_end_at;
      if (!end) return true;
      const endDate = new Date(end);
      return Date.now() < endDate.getTime();
    } catch {
      return false;
    }
  }

  // Votar (optimistic UI + backend)
  vote(post: Queja, choice: 'accept' | 'reject'): void {
    if (!this.canVote(post)) return;

    const positive = choice === 'accept';
    // optimistic UI
    (post as any).userVote = positive ? 'YES' : 'NO';
    (post as any).votes = (post as any).votes ?? { yes: 0, no: 0, total: 0 };
    if (positive) { (post as any).votes.yes++; } else { (post as any).votes.no++; }
    (post as any).votes.total = ((post as any).votes.yes || 0) + ((post as any).votes.no || 0);

    this.quejaService.vote(post.id, positive).subscribe({
      next: (res: any) => {
        (post as any).votes.yes = res.yes;
        (post as any).votes.no = res.no;
        (post as any).votes.total = (res.yes || 0) + (res.no || 0);
        (post as any).userVote = res.userVote;
        (post as any).canVote = false;
      },
      error: (err: any) => {
        console.error('Error al votar', err);
        // revertir
        if (positive) { (post as any).votes.yes = Math.max(0, (post as any).votes.yes - 1); }
        else { (post as any).votes.no = Math.max(0, (post as any).votes.no - 1); }
        (post as any).votes.total = ((post as any).votes.yes || 0) + ((post as any).votes.no || 0);
        (post as any).userVote = null;
      }
    });
  }

  // Reacciones (toggle)
  toggleReaction(post: Queja, type: string): void {
    if (!(post as any).reactions) {
      (post as any).reactions = { counts: {}, userReaction: null, total: 0 };
    }
    const current = (post as any).reactions.userReaction ?? null;
    const willAdd = current !== type;

    // optimistic update
    if (willAdd) {
      if ((post as any).reactions.userReaction) {
        const prev = (post as any).reactions.userReaction!;
        (post as any).reactions.counts[prev] = ((post as any).reactions.counts[prev] || 1) - 1;
      }
      (post as any).reactions.counts[type] = ((post as any).reactions.counts[type] || 0) + 1;
      (post as any).reactions.userReaction = type;
    } else {
      (post as any).reactions.counts[type] = Math.max(0, ((post as any).reactions.counts[type] || 1) - 1);
      (post as any).reactions.userReaction = null;
    }

    this.quejaService.toggleReaction(post.id, type).subscribe({
      next: (res: any) => {
        if (res.counts) {
          (post as any).reactions.counts = res.counts as Record<string, number>;
          (post as any).reactions.total = Object.values(res.counts as Record<string, number>).reduce((a, b) => a + (b || 0), 0);
        }
        (post as any).reactions.userReaction = res.userReaction ?? (post as any).reactions.userReaction;
      },
      error: (err: any) => {
        console.error('Error toggling reaction', err);
        // fallback: reload single post
        this.quejaService.getById(post.id).subscribe({
          next: (fresh: any) => Object.assign(post, this.normalizePost(fresh)),
          error: (e: any) => console.error('Error reloading post after reaction failure', e)
        });
      }
    });
  }

  toggleComments(post: Queja): void {
    (post as any).comments = (post as any).comments ?? [];
    (post as any).showComments = !((post as any).showComments);
  }

  addComment(post: Queja, commentContent: string): void {
    if (!commentContent?.trim()) return;
    const newComment = {
      id: Date.now().toString(),
      author: { id: this.user?.id ?? 'anonymous', nombre: this.user?.name ?? 'Usuario' },
      text: commentContent.trim(),
      createdAt: new Date().toISOString()
    };
    (post as any).comments = (post as any).comments ?? [];
    (post as any).comments.push(newComment);
    (post as any).commentsCount = ((post as any).commentsCount || 0) + 1;
    // TODO: persistir con mutation
  }

  toggleBookmark(post: Queja): void {
    (post as any).meta = (post as any).meta || {};
    (post as any).meta.saved = !((post as any).meta.saved);
  }

  sharePost(post: Queja): void {
    const title = (post as any).title ?? (post as any).descripcion;
    const text = (post as any).description ?? (post as any).descripcion;
    if (navigator.share) {
      navigator.share({ title, text, url: `${location.href}?post=${post.id}` }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${title}\n\n${text}`).then(() => {
        console.log('Compartido al portapapeles');
      }).catch(() => alert('No se pudo compartir'));
    }
  }

  downloadPostJson(post: Queja): void {
    if (typeof (this.quejaService as any).downloadQuejaJson === 'function') {
      (this.quejaService as any).downloadQuejaJson(post);
      return;
    }
    const data = {
      id: (post as any).id,
      title: (post as any).title ?? (post as any).descripcion,
      description: (post as any).description ?? (post as any).descripcion,
      author: (post as any).usuario ?? (post as any).author,
      date: (post as any).fechaCreacion ?? (post as any).createdAt,
      location: (post as any).address ?? (post as any).ubicacion,
      votes: (post as any).votes ?? { yes: 0, no: 0, total: 0 },
      reactions: (post as any).reactions ?? { counts: {}, userReaction: null }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(post as any).id || 'report'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ============================================
  // HELPER METHODS FOR TEMPLATE
  // ============================================

  getAvatarUrl(post: Queja): string {
    const usuario = (post as any).usuario;
    return usuario?.fotoPerfil || usuario?.avatarUrl || 'assets/img/default-avatar.png';
  }

  getAuthorName(post: Queja): string {
    const usuario = (post as any).usuario;
    return usuario?.nombre || 'Usuario';
  }

  getPostDate(post: Queja): string {
    const date = post.fechaCreacion || (post as any).createdAt;
    return this.formatDate(date);
  }

  getLocation(post: Queja): string {
    return (post as any).address || (post as any).ubicacion || '';
  }

  hasLocation(post: Queja): boolean {
    return !!((post as any).address || (post as any).ubicacion);
  }

  getTitle(post: Queja): string {
    return (post as any).title || post.descripcion || '';
  }

  getDescription(post: Queja): string {
    return (post as any).description || post.descripcion || '';
  }

  getCategoryName(post: Queja): string {
    const category = (post as any).category;
    return category?.nombre || category?.id || 'Sin categoría';
  }

  hasEvidence(post: Queja): boolean {
    const evidence = (post as any).evidence;
    return evidence && Array.isArray(evidence) && evidence.length > 0;
  }

  getFirstEvidenceUrl(post: Queja): string {
    const evidence = (post as any).evidence;
    if (evidence && evidence[0]?.url) {
      return evidence[0].url;
    }
    return (post as any).imagen_url || '';
  }

  hasVotes(post: Queja): boolean {
    return !!(post as any).votes;
  }

  getYesVotes(post: Queja): number {
    return (post as any).votes?.yes || 0;
  }

  getNoVotes(post: Queja): number {
    return (post as any).votes?.no || 0;
  }

  getLikeEmoji(post: Queja): string {
    const reactions = (post as any).reactions;
    const hasLikes = this.getReactionCount(post, 'like') > 0;
    const userLiked = reactions?.userReaction === 'like';
    return (hasLikes && userLiked) ? '❤️' : '🤍';
  }

  getBookmarkEmoji(post: Queja): string {
    const meta = (post as any).meta;
    return meta?.saved ? '🔖' : '📑';
  }

  getShowComments(post: Queja): boolean {
    return !!(post as any).showComments;
  }

  getCommentAuthor(comment: any): string {
    return comment?.author?.nombre || comment?.author || 'Usuario';
  }

  getCommentText(comment: any): string {
    return comment?.text || comment?.content || '';
  }

  getReactionCount(post: Queja, type: string): number {
    return ((post as any).reactions?.counts?.[type] ?? 0) as number;
  }

  getTotalVotes(post: Queja): number {
    return ((post as any).votes?.yes ?? 0) + ((post as any).votes?.no ?? 0);
  }

  canVote(post: Queja): boolean {
    return ((post as any).canVote ?? true) && !((post as any).userVote);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'hace unos minutos';
    if (diffInHours < 24) return `hace ${diffInHours} horas`;
    if (diffInHours < 48) return 'hace 1 día';
    return `hace ${Math.floor(diffInHours / 24)} días`;
  }

  trackByPostId(index: number, post: any): number | string {
    return (post as any).id ?? index;
  }

  trackByComment(index: number, comment: any): number | string {
    return comment.id ?? index;
  }

  // ============================================
  // CREATE REPORT MODAL METHODS
  // ============================================

  openCreateReport(): void {
    this.showCreateModal = true;
    this.resetQuejaForm();
  }

  openCreateReportWithMedia(): void {
    this.showCreateModal = true;
    this.resetQuejaForm();
  }

  openCreateReportWithLocation(): void {
    this.showCreateModal = true;
    this.resetQuejaForm();
    setTimeout(() => document.getElementById('ubicacion')?.focus(), 100);
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetQuejaForm();
  }

  resetQuejaForm(): void {
    this.newQueja = {
      titulo: '',
      descripcion: '',
      categoria: '',
      ubicacion: '',
      imagenFile: null,
      imagenPreview: null
    };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.newQueja.imagenFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newQueja.imagenPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.newQueja.imagenFile = null;
    this.newQueja.imagenPreview = null;
  }

  isFormValid(): boolean {
    return !!(
      this.newQueja.titulo.trim() &&
      this.newQueja.descripcion.trim() &&
      this.newQueja.categoria
    );
  }

  submitQueja(): void {
    if (!this.isFormValid()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const formData = new FormData();
    formData.append('titulo', this.newQueja.titulo);
    formData.append('descripcion', this.newQueja.descripcion);
    formData.append('categoria', this.newQueja.categoria);
    if (this.newQueja.ubicacion) {
      formData.append('ubicacion', this.newQueja.ubicacion);
    }
    if (this.newQueja.imagenFile) {
      formData.append('imagen', this.newQueja.imagenFile);
    }
    if (this.user?.id) {
      formData.append('usuario_id', this.user.id);
    }

    this.loading = true;
    
    // Verificar si el método create existe
    if (typeof this.quejaService.create === 'function') {
      this.quejaService.create(formData as any).subscribe({
        next: (nuevaQueja: any) => {
          console.log('Queja creada exitosamente', nuevaQueja);
          const normalized = this.normalizePost(nuevaQueja);
          this.posts.unshift(normalized);
          this.closeCreateModal();
          this.loading = false;
          alert('¡Reporte publicado exitosamente!');
        },
        error: (err: any) => {
          console.error('Error al crear queja', err);
          this.loading = false;
          alert('Error al publicar el reporte. Por favor intenta de nuevo.');
        }
      });
    } else {
      // Fallback: crear queja localmente si el servicio no tiene el método
      console.warn('El método create() no existe en QuejaService. Creando queja localmente.');
      
      const nuevaQueja = {
        id: Date.now().toString(),
        titulo: this.newQueja.titulo,
        descripcion: this.newQueja.descripcion,
        categoria: { id: this.newQueja.categoria, nombre: this.newQueja.categoria },
        ubicacion: this.newQueja.ubicacion,
        usuario: {
          id: this.user?.id,
          nombre: this.user?.name,
          fotoPerfil: this.user?.avatarUrl
        },
        fechaCreacion: new Date().toISOString(),
        estado: { id: 1, nombre: 'Pendiente' },
        imagen_url: this.newQueja.imagenPreview,
        votes: { yes: 0, no: 0, total: 0 },
        reactions: { counts: {}, userReaction: null, total: 0 },
        comments: [],
        commentsCount: 0
      };
      
      const normalized = this.normalizePost(nuevaQueja);
      this.posts.unshift(normalized);
      this.closeCreateModal();
      this.loading = false;
      alert('¡Reporte creado localmente! (Nota: No se guardó en el servidor)');
    }
  }
}