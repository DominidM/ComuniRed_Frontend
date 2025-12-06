import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuejaService, Queja, Usuario } from '../../services/queja.service';
import { ReaccionService } from '../../services/reaccion.service';
import { ComentarioService } from '../../services/comentario.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-feed-reporte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed-reporte.component.html',
  styleUrls: ['./feed-reporte.component.css']
})
export class FeedReporteComponent implements OnInit {
  quejaId: string = '';
  queja: Queja | null = null;
  loading = false;
  error: string = '';
  
  user: { id?: string; name: string; avatarUrl: string } | null = null;
  
  showReactionMenu: { [postId: string]: boolean } = {};
  showCommentsModal = false;
  showCommentsInline = false;
  
  newCommentText = '';
  newCommentInline = '';
  
  editingCommentId: string | null = null;
  editingCommentText = '';
  
  toastMessage = '';
  showToast = false;

  showEditModal = false;
  editingQueja: Queja | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quejaService: QuejaService,
    private reaccionService: ReaccionService,
    private comentarioService: ComentarioService,
    private usuarioService: UsuarioService
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.closeAllReactionMenus();
  }

  ngOnInit(): void {
    this.loadUser();
    
    this.route.params.subscribe(params => {
      this.quejaId = params['id'];
      if (this.quejaId) {
        this.cargarQueja();
      }
    });
  }

  loadUser(): void {
    const u = this.usuarioService.getUser();
    if (u) {
      const avatar = (u as any).foto_perfil || 'assets/img/default-avatar.png';
      this.user = { 
        id: (u as any).id || undefined, 
        name: `${(u as any).nombre || ''} ${(u as any).apellido || ''}`.trim() || 'Usuario', 
        avatarUrl: avatar 
      };
    } else {
      this.user = { name: 'Usuario', avatarUrl: 'assets/img/default-avatar.png' };
    }
  }

  cargarQueja(): void {
    if (!this.user?.id) return;
    
    this.loading = true;
    this.error = '';
    
    this.quejaService.obtenerQuejaPorId(this.quejaId, this.user.id).subscribe({
      next: (queja) => {
        this.queja = {
          ...queja,
          showMenu: false,
          comments: Array.isArray(queja.comments) ? [...queja.comments] : []
        };
        this.loading = false;
        console.log('✅ Queja cargada:', this.queja);
      },
      error: (err) => {
        console.error('❌ Error cargando queja:', err);
        this.error = 'No se pudo cargar el reporte';
        this.loading = false;
      }
    });
  }

  // ==================== REACCIONES ====================
  closeAllReactionMenus(): void {
    this.showReactionMenu = {};
  }

  toggleReactionMenu(postId: string, event: Event): void {
    event.stopPropagation();
    Object.keys(this.showReactionMenu).forEach(key => {
      if (key !== postId) this.showReactionMenu[key] = false;
    });
    this.showReactionMenu[postId] = !this.showReactionMenu[postId];
  }

  selectReaction(post: Queja, type: string, event: Event): void {
    event.stopPropagation();
    this.toggleReaction(post, type);
    this.showReactionMenu[post.id] = false;
  }

  toggleReaction(post: Queja, type: string): void {
    if (!this.user?.id) return;

    const previousReactions = { ...post.reactions, counts: { ...post.reactions.counts } };
    const previousUserReaction = post.reactions.userReaction;

    if (previousUserReaction === type) {
      const currentCount = post.reactions.counts[type] ?? 0;
      post.reactions.counts[type] = Math.max(0, currentCount - 1);
      post.reactions.userReaction = undefined;
    } else {
      if (previousUserReaction) {
        const prevCount = post.reactions.counts[previousUserReaction] ?? 0;
        post.reactions.counts[previousUserReaction] = Math.max(0, prevCount - 1);
      }
      const currentCount = post.reactions.counts[type] ?? 0;
      post.reactions.counts[type] = currentCount + 1;
      post.reactions.userReaction = type;
    }
    
    const total = Object.values(post.reactions.counts).reduce((sum: number, val) => sum + (val ?? 0), 0);
    post.reactions.total = total;

    this.reaccionService.toggleReaccion(post.id, type, this.user.id).subscribe({
      next: (updated) => {
        post.reactions = updated;
      },
      error: (err: any) => {
        console.error('Error al reaccionar', err);
        post.reactions = previousReactions;
      }
    });
  }

  getReactionCount(post: Queja, type: string): number {
    return post.reactions?.counts?.[type] ?? 0;
  }

  getReactionIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'like': '❤️',
      'love': '😍',
      'wow': '😮',
      'helpful': '👍',
      'dislike': '👎'
    };
    return icons[type] || '👍';
  }

  // ==================== COMENTARIOS INLINE ====================
  toggleCommentsInline(): void {
    this.showCommentsInline = !this.showCommentsInline;
  }

  addCommentInline(): void {
    if (!this.newCommentInline.trim() || !this.queja || !this.user?.id) return;

    const tempComment = {
      id: 'temp-' + Date.now(),
      texto: this.newCommentInline.trim(),
      author: {
        id: this.user.id,
        nombre: this.user.name.split(' ')[0] || 'Usuario',
        apellido: this.user.name.split(' ')[1] || '',
        foto_perfil: this.user.avatarUrl
      },
      fecha_creacion: new Date().toISOString(),
      fecha_modificacion: undefined,
      showMenu: false
    };

    if (!Array.isArray(this.queja.comments)) {
      this.queja.comments = [];
    }

    this.queja.comments = [...this.queja.comments, tempComment as any];
    this.queja.commentsCount = this.queja.comments.length;

    const commentText = this.newCommentInline.trim();
    this.newCommentInline = '';

    this.comentarioService.agregarComentario(this.queja.id, this.user.id, commentText).subscribe({
      next: (newComment) => {
        if (this.queja) {
          const commentIndex = this.queja.comments.findIndex(c => c.id === tempComment.id);
          if (commentIndex !== -1) {
            this.queja.comments = [
              ...this.queja.comments.slice(0, commentIndex),
              newComment,
              ...this.queja.comments.slice(commentIndex + 1)
            ];
          }
        }
        this.showToastMessage('Comentario agregado');
      },
      error: (err: any) => {
        console.error('Error al comentar', err);
        if (this.queja) {
          this.queja.comments = this.queja.comments.filter(c => c.id !== tempComment.id);
          this.queja.commentsCount = this.queja.comments.length;
        }
        this.showToastMessage('Error al agregar comentario');
      }
    });
  }

  deleteCommentInline(comment: any): void {
    if (!this.user?.id || !this.queja || !confirm('¿Eliminar este comentario?')) return;

    this.comentarioService.eliminarComentario(comment.id, this.user.id).subscribe({
      next: () => {
        if (this.queja) {
          this.queja.comments = this.queja.comments.filter(c => c.id !== comment.id);
          this.queja.commentsCount = this.queja.comments.length;
        }
        this.showToastMessage('Comentario eliminado');
      },
      error: (err: any) => {
        console.error('Error al eliminar comentario', err);
        this.showToastMessage('Error al eliminar comentario');
      }
    });
  }

  getPreviewComments(): any[] {
    return (this.queja?.comments || []).slice(0, 3);
  }

  hasMoreComments(): boolean {
    return (this.queja?.comments || []).length > 3;
  }

  // ==================== MODAL COMENTARIOS ====================
  openCommentsModal(): void {
    if (!this.queja) return;
    this.showCommentsModal = true;
  }

  closeCommentsModal(): void {
    this.showCommentsModal = false;
    this.newCommentText = '';
    this.editingCommentId = null;
    this.editingCommentText = '';
  }

  addComment(): void {
    if (!this.newCommentText.trim() || !this.queja || !this.user?.id) return;

    const tempComment = {
      id: 'temp-' + Date.now(),
      texto: this.newCommentText.trim(),
      author: {
        id: this.user.id,
        nombre: this.user.name.split(' ')[0] || 'Usuario',
        apellido: this.user.name.split(' ')[1] || '',
        foto_perfil: this.user.avatarUrl
      },
      fecha_creacion: new Date().toISOString(),
      showMenu: false
    };

    if (!Array.isArray(this.queja.comments)) {
      this.queja.comments = [];
    }

    this.queja.comments = [...this.queja.comments, tempComment as any];
    this.queja.commentsCount = this.queja.comments.length;

    const commentText = this.newCommentText.trim();
    this.newCommentText = '';

    this.comentarioService.agregarComentario(this.queja.id, this.user.id, commentText).subscribe({
      next: (newComment) => {
        if (this.queja) {
          const commentIndex = this.queja.comments.findIndex(c => c.id === tempComment.id);
          if (commentIndex !== -1) {
            this.queja.comments = [
              ...this.queja.comments.slice(0, commentIndex),
              newComment,
              ...this.queja.comments.slice(commentIndex + 1)
            ];
          }
        }
        this.showToastMessage('Comentario agregado');
      },
      error: (err: any) => {
        console.error('Error al comentar', err);
        if (this.queja) {
          this.queja.comments = this.queja.comments.filter(c => c.id !== tempComment.id);
          this.queja.commentsCount = this.queja.comments.length;
        }
        this.showToastMessage('Error al agregar comentario');
      }
    });
  }

  startEditComment(comment: any): void {
    this.editingCommentId = comment.id;
    this.editingCommentText = comment.texto;
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editingCommentText = '';
  }

  saveEditComment(): void {
    if (!this.editingCommentId || !this.editingCommentText.trim() || !this.queja || !this.user?.id) return;

    const commentIndex = this.queja.comments.findIndex(c => c.id === this.editingCommentId);
    if (commentIndex !== -1) {
      const previousText = this.queja.comments[commentIndex].texto;

      this.queja.comments = [
        ...this.queja.comments.slice(0, commentIndex),
        {
          ...this.queja.comments[commentIndex],
          texto: this.editingCommentText.trim(),
          fecha_modificacion: new Date().toISOString()
        } as any,
        ...this.queja.comments.slice(commentIndex + 1)
      ];

      this.comentarioService.actualizarComentario(
        this.editingCommentId,
        this.user.id,
        this.editingCommentText.trim()
      ).subscribe({
        next: () => {
          this.showToastMessage('Comentario actualizado');
          this.cancelEditComment();
        },
        error: (err: any) => {
          console.error('Error al actualizar comentario', err);
          if (this.queja) {
            this.queja.comments = [
              ...this.queja.comments.slice(0, commentIndex),
              {
                ...this.queja.comments[commentIndex],
                texto: previousText
              },
              ...this.queja.comments.slice(commentIndex + 1)
            ];
          }
          this.showToastMessage('Error al actualizar comentario');
        }
      });
    }
  }

  deleteComment(comment: any): void {
    if (!this.user?.id || !this.queja || !confirm('¿Eliminar este comentario?')) return;

    this.comentarioService.eliminarComentario(comment.id, this.user.id).subscribe({
      next: () => {
        if (this.queja) {
          this.queja.comments = this.queja.comments.filter(c => c.id !== comment.id);
          this.queja.commentsCount = this.queja.comments.length;
        }
        this.showToastMessage('Comentario eliminado');
      },
      error: (err: any) => {
        console.error('Error al eliminar comentario', err);
        this.showToastMessage('Error al eliminar comentario');
      }
    });
  }

  canEditComment(comment: any): boolean {
    return comment.author?.id === this.user?.id;
  }

  getCommentsCount(): number {
    return this.queja?.commentsCount || (this.queja?.comments || []).length;
  }

  // ==================== EDITAR/ELIMINAR REPORTE ====================
  canEditQueja(): boolean {
    return this.queja?.usuario?.id === this.user?.id;
  }

  openEditQueja(): void {
    if (!this.queja) return;
    this.editingQueja = JSON.parse(JSON.stringify(this.queja));
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingQueja = null;
  }

  saveEditQueja(): void {
    if (!this.editingQueja || !this.user?.id) return;

    this.loading = true;

    this.quejaService.actualizarQueja(
      this.editingQueja.id,
      this.editingQueja.titulo,
      this.editingQueja.descripcion,
      this.editingQueja.categoria?.id,
      this.editingQueja.estado?.id,
      this.editingQueja.ubicacion,
      this.user.id
    ).subscribe({
      next: (updated) => {
        this.queja = { 
          ...updated, 
          showMenu: false,
          fue_editado: true,
          comments: this.queja?.comments || []
        };
        this.closeEditModal();
        this.loading = false;
        this.showToastMessage('Reporte actualizado');
      },
      error: (err: any) => {
        console.error('Error al actualizar queja', err);
        this.loading = false;
        this.showToastMessage('Error al actualizar reporte');
      }
    });
  }

  deleteQueja(): void {
    if (!this.queja || !this.user?.id || !confirm('¿Eliminar este reporte permanentemente?')) return;

    this.loading = true;

    this.quejaService.eliminarQueja(this.queja.id, this.user.id).subscribe({
      next: () => {
        this.showToastMessage('Reporte eliminado');
        setTimeout(() => {
          this.router.navigate(['/public/profile']);
        }, 1500);
      },
      error: (err: any) => {
        console.error('Error al eliminar queja', err);
        this.loading = false;
        this.showToastMessage('Error al eliminar reporte');
      }
    });
  }

  // ==================== UTILIDADES ====================
  volver(): void {
    this.router.navigate(['/public/profile']);
  }

  verPerfilUsuario(usuario: Usuario): void {
    if (!usuario?.id) return;
    if (usuario.id === this.user?.id) {
      this.router.navigate(['/public/profile']);
    } else {
      this.router.navigate(['/public/user-profile', usuario.id]);
    }
  }

  getAvatarUrl(usuario: Usuario): string {
    return usuario?.foto_perfil || 'assets/img/default-avatar.png';
  }

  getAuthorName(usuario: Usuario): string {
    return `${usuario.nombre} ${usuario.apellido}`.trim() || 'Usuario';
  }

  getCommentAuthor(comment: any): string {
    return `${comment.author?.nombre || ''} ${comment.author?.apellido || ''}`.trim() || 'Usuario';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'hace unos minutos';
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    if (diffInHours < 48) return 'hace 1 día';
    const days = Math.floor(diffInHours / 24);
    return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
  }

  formatCommentDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'justo ahora';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 172800) return 'hace 1 día';
    if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  getImageUrl(): string {
    return this.queja?.imagen_url || this.queja?.evidence?.[0]?.url || '';
  }

  hasImage(): boolean {
    return !!(this.queja?.imagen_url || (this.queja?.evidence && this.queja.evidence.length > 0));
  }

  getEstadoClass(estado: string): string {
    const estadoMap: { [key: string]: string } = {
      'Pendiente': 'estado-pendiente',
      'En Proceso': 'estado-proceso',
      'Resuelta': 'estado-resuelta',
      'Rechazada': 'estado-rechazada'
    };
    return estadoMap[estado] || 'estado-pendiente';
  }

  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  trackByComment(index: number, comment: any): string {
    return comment.id;
  }
}