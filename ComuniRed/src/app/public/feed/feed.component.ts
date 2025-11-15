import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';  // ✅ AGREGAR
import { QuejaService, Queja, Usuario } from '../../services/queja.service';
import { ReaccionService } from '../../services/reaccion.service';
import { ComentarioService } from '../../services/comentario.service';
import { CategoriaService, Categoria } from '../../services/categoria.service';
import { UsuarioService } from '../../services/usuario.service';

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
  filteredPosts: Queja[] = [];
  loading = false;
  categorias: Categoria[] = [];
  
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  sortBy: 'recent' | 'popular' | 'votes' = 'recent';
  
  showCreateModal = false;
  newQueja = {
    titulo: '',
    descripcion: '',
    categoriaId: '',
    ubicacion: '',
    imagenFile: null as File | null,
    imagenPreview: null as string | null
  };

  showEditModal = false;
  editingQueja: Queja | null = null;

  editingCommentId: string | null = null;
  editingCommentText = '';

  toastMessage = '';
  showToast = false;

  page = 0;
  hasMore = true;

  constructor(
    private quejaService: QuejaService,
    private reaccionService: ReaccionService,
    private comentarioService: ComentarioService,
    private categoriaService: CategoriaService,
    private usuarioService: UsuarioService,
    private router: Router  // ✅ AGREGAR
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadCategorias();
    this.loadPosts();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 100 && !this.loading && this.hasMore) {
      this.loadMorePosts();
    }
  }

  loadMorePosts(): void {
    console.log('Cargando más posts...');
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

  loadCategorias(): void {
    this.categoriaService.obtenerCategorias(0, 100).subscribe({
      next: (page) => {
        this.categorias = page.content.filter(c => c.activo);
      },
      error: (err) => {
        console.error('Error cargando categorías', err);
        this.categorias = [
          { id: '68f5c40c77c9f1339092c6f5', nombre: 'Vías', descripcion: '', activo: true },
          { id: '68f5c40c77c9f1339092c6f2', nombre: 'Alumbrado', descripcion: '', activo: true },
          { id: '68f5c40c77c9f1339092c6f7', nombre: 'Agua y Saneamiento', descripcion: '', activo: true },
          { id: '68f5c40c77c9f1339092c6f3', nombre: 'Limpieza', descripcion: '', activo: true },
          { id: '68f5c40c77c9f1339092c6f4', nombre: 'Seguridad', descripcion: '', activo: true },
          { id: '68f5c40c77c9f1339092c6f6', nombre: 'Señalización', descripcion: '', activo: true }
        ];
      }
    });
  }

  loadPosts(): void {
    if (!this.user?.id) return;
    
    this.loading = true;
    this.quejaService.obtenerQuejas(this.user.id).subscribe({
      next: (quejas) => {
        console.log('📦 Quejas cargadas del backend:', quejas);
        
        this.posts = quejas.map(q => {
          const reactions = {
            total: q.reactions?.total || 0,
            userReaction: q.reactions?.userReaction || undefined,
            counts: {
              like: q.reactions?.counts?.['like'] || 0,
              love: q.reactions?.counts?.['love'] || 0,
              wow: q.reactions?.counts?.['wow'] || 0,
              helpful: q.reactions?.counts?.['helpful'] || 0,
              dislike: q.reactions?.counts?.['dislike'] || 0,
              report: q.reactions?.counts?.['report'] || 0
            }
          };

          const votes = {
            yes: q.votes?.yes || 0,
            no: q.votes?.no || 0,
            total: q.votes?.total || 0
          };

          return {
            ...q,
            reactions,
            votes,
            showComments: false,
            showMenu: false,
            comments: q.comments || [],
            commentsCount: q.commentsCount || 0
          };
        });
        
        console.log('✅ Posts procesados:', this.posts);
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error cargando quejas:', err);
        this.loading = false;
        this.showToastMessage('Error al cargar reportes');
      }
    });
  }

  refreshPosts(): void {
    this.showToastMessage('Actualizando...');
    this.loadPosts();
  }

  applyFilters(): void {
    let filtered = [...this.posts];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.titulo.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term) ||
        p.ubicacion?.toLowerCase().includes(term)
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.categoria?.id === this.selectedCategory);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(p => p.estado?.id === this.selectedStatus);
    }

    filtered = this.sortPosts(filtered);

    this.filteredPosts = filtered;
  }

  sortPosts(posts: Queja[]): Queja[] {
    switch (this.sortBy) {
      case 'recent':
        return posts.sort((a, b) => 
          new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
        );
      case 'popular':
        return posts.sort((a, b) => 
          (b.reactions?.total || 0) - (a.reactions?.total || 0)
        );
      case 'votes':
        return posts.sort((a, b) => 
          this.getTotalVotes(b) - this.getTotalVotes(a)
        );
      default:
        return posts;
    }
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoryFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.sortBy = 'recent';
    this.applyFilters();
  }

  vote(post: Queja, choice: 'accept' | 'reject'): void {
    if (!this.canVote(post) || !this.user?.id) return;

    const previousVotes = { ...post.votes };
    const previousCanVote = post.canVote;
    
    if (choice === 'accept') {
      post.votes.yes++;
    } else {
      post.votes.no++;
    }
    post.votes.total = post.votes.yes + post.votes.no;
    post.canVote = false;

    this.reaccionService.toggleReaccion(post.id, choice, this.user.id).subscribe({
      next: () => {
        this.quejaService.obtenerQuejaPorId(post.id, this.user!.id!).subscribe({
          next: (updated) => {
            const index = this.posts.findIndex(p => p.id === post.id);
            if (index !== -1) {
              this.posts[index] = { ...updated, showComments: post.showComments };
              this.applyFilters();
            }
            this.showToastMessage('Voto registrado');
          }
        });
      },
      error: (err) => {
        console.error('Error al votar', err);
        post.votes = previousVotes;
        post.canVote = previousCanVote;
        this.showToastMessage('Error al votar');
      }
    });
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
    
    const total = Object.values(post.reactions.counts)
      .reduce((sum: number, val) => sum + (val ?? 0), 0);
    post.reactions.total = total;

    this.reaccionService.toggleReaccion(post.id, type, this.user.id).subscribe({
      next: (updated) => {
        post.reactions = updated;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error al reaccionar', err);
        post.reactions = previousReactions;
      }
    });
  }

  toggleComments(post: Queja): void {
    post.showComments = !post.showComments;
  }

  // ✅ ACTUALIZADO: Refetch después de agregar comentario
  addComment(post: Queja, text: string): void {
    if (!text?.trim() || !this.user?.id) return;

    this.comentarioService.agregarComentario(post.id, this.user.id, text.trim()).subscribe({
      next: (newComment) => {
        post.comments.push(newComment);
        post.commentsCount = post.comments.length;
        
        // ✅ Refetch para actualizar todo el post
        this.quejaService.obtenerQuejaPorId(post.id, this.user!.id!).subscribe({
          next: (updated) => {
            const index = this.posts.findIndex(p => p.id === post.id);
            if (index !== -1) {
              this.posts[index] = { ...updated, showComments: true };
              this.applyFilters();
            }
          }
        });
        
        this.showToastMessage('Comentario agregado');
      },
      error: (err) => {
        console.error('Error al comentar', err);
        this.showToastMessage('Error al agregar comentario');
      }
    });
  }

  startEditComment(comment: any): void {
    this.editingCommentId = comment.id;
    this.editingCommentText = comment.texto;
  }

  saveEditComment(post: Queja): void {
    if (!this.editingCommentId || !this.editingCommentText.trim()) return;

    const comment = post.comments.find(c => c.id === this.editingCommentId);
    if (comment) {
      comment.texto = this.editingCommentText;
      this.cancelEditComment();
      this.showToastMessage('Comentario actualizado');
    }
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editingCommentText = '';
  }

  deleteComment(post: Queja, commentId: string): void {
    if (!this.user?.id || !confirm('¿Eliminar este comentario?')) return;

    this.comentarioService.eliminarComentario(commentId, this.user.id, post.id).subscribe({
      next: () => {
        post.comments = post.comments.filter(c => c.id !== commentId);
        post.commentsCount = post.comments.length;
        this.showToastMessage('Comentario eliminado');
      },
      error: (err) => {
        console.error('Error al eliminar comentario', err);
        this.showToastMessage('Error al eliminar comentario');
      }
    });
  }

  canEditComment(comment: any): boolean {
    return comment.author?.id === this.user?.id;
  }

  canEditQueja(post: Queja): boolean {
    return post.usuario?.id === this.user?.id;
  }

  openEditQueja(post: Queja): void {
    this.editingQueja = { ...post };
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
        const index = this.posts.findIndex(p => p.id === updated.id);
        if (index !== -1) {
          this.posts[index] = { ...updated, showComments: this.posts[index].showComments };
          this.applyFilters();
        }
        this.closeEditModal();
        this.loading = false;
        this.showToastMessage('Reporte actualizado');
      },
      error: (err) => {
        console.error('Error al actualizar queja', err);
        this.loading = false;
        this.showToastMessage('Error al actualizar reporte');
      }
    });
  }

  deleteQueja(post: Queja): void {
    if (!this.user?.id || !confirm('¿Eliminar este reporte permanentemente?')) return;

    this.loading = true;

    this.quejaService.eliminarQueja(post.id, this.user.id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== post.id);
        this.applyFilters();
        this.loading = false;
        this.showToastMessage('Reporte eliminado');
      },
      error: (err) => {
        console.error('Error al eliminar queja', err);
        this.loading = false;
        this.showToastMessage('Error al eliminar reporte');
      }
    });
  }

  toggleBookmark(post: Queja): void {
    (post as any).meta = (post as any).meta || {};
    (post as any).meta.saved = !((post as any).meta.saved);
    this.showToastMessage((post as any).meta.saved ? 'Guardado' : 'Eliminado de guardados');
  }

  sharePost(post: Queja): void {
    const url = `${location.origin}/quejas/${post.id}`;
    if (navigator.share) {
      navigator.share({ 
        title: post.titulo, 
        text: post.descripcion, 
        url 
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.showToastMessage('Enlace copiado al portapapeles');
      }).catch(() => this.showToastMessage('No se pudo compartir'));
    }
  }

  downloadPostJson(post: Queja): void {
    const data = JSON.stringify(post, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `queja-${post.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    this.showToastMessage('JSON descargado');
  }

  openCreateReport(): void {
    this.showCreateModal = true;
    this.resetQuejaForm();
  }

  openCreateReportWithMedia(): void {
    this.showCreateModal = true;
    this.resetQuejaForm();
    setTimeout(() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click(), 100);
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
      categoriaId: '',
      ubicacion: '',
      imagenFile: null,
      imagenPreview: null
    };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        this.showToastMessage('La imagen no debe superar 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        this.showToastMessage('Solo se permiten imágenes');
        return;
      }

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
      this.newQueja.categoriaId
    );
  }

  submitQueja(): void {
    if (!this.isFormValid() || !this.user?.id) {
      this.showToastMessage('Por favor completa todos los campos requeridos');
      return;
    }

    this.loading = true;

    this.quejaService.crearQueja(
      this.newQueja.titulo,
      this.newQueja.descripcion,
      this.newQueja.categoriaId,
      this.user.id,
      this.newQueja.ubicacion || undefined,
      this.newQueja.imagenFile || undefined
    ).subscribe({
      next: (nuevaQueja) => {
        console.log('Queja creada exitosamente', nuevaQueja);
        this.loadPosts();
        this.closeCreateModal();
        this.loading = false;
        this.showToastMessage('¡Reporte publicado exitosamente!');
      },
      error: (err) => {
        console.error('Error al crear queja', err);
        this.loading = false;
        this.showToastMessage('Error al publicar el reporte');
      }
    });
  }

  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  // ✅ NUEVO: Ver perfil de usuario
  verPerfilUsuario(usuario: Usuario): void {
    if (!usuario?.id) return;
    
    if (usuario.id === this.user?.id) {
      this.router.navigate(['/public/profile']);
    } else {
      this.router.navigate(['/public/user-profile', usuario.id]);
    }
  }

  getAvatarUrl(post: Queja): string {
    return post.usuario?.foto_perfil || 'assets/img/default-avatar.png';
  }

  getAuthorName(post: Queja): string {
    return `${post.usuario.nombre} ${post.usuario.apellido}`.trim() || 'Usuario';
  }

  getPostDate(post: Queja): string {
    return this.formatDate(post.fecha_creacion);
  }

  getLocation(post: Queja): string {
    return post.ubicacion || '';
  }

  hasLocation(post: Queja): boolean {
    return !!post.ubicacion;
  }

  getTitle(post: Queja): string {
    return post.titulo;
  }

  getDescription(post: Queja): string {
    return post.descripcion;
  }

  getCategoryName(post: Queja): string {
    return post.categoria?.nombre || 'Sin categoría';
  }

  hasEvidence(post: Queja): boolean {
    return post.evidence && post.evidence.length > 0;
  }

  getFirstEvidenceUrl(post: Queja): string {
    return post.evidence?.[0]?.url || post.imagen_url || '';
  }

  hasVotes(post: Queja): boolean {
    return !!post.votes;
  }

  getYesVotes(post: Queja): number {
    return post.votes?.yes || 0;
  }

  getNoVotes(post: Queja): number {
    return post.votes?.no || 0;
  }

  getTotalVotes(post: Queja): number {
    return (post.votes?.yes || 0) + (post.votes?.no || 0);
  }

  canVote(post: Queja): boolean {
    return post.canVote && !post.userVote;
  }

  getLikeEmoji(post: Queja): string {
    return post.reactions?.userReaction === 'like' ? '❤️' : '🤍';
  }

  getBookmarkEmoji(post: Queja): string {
    return (post as any).meta?.saved ? '🔖' : '📑';
  }

  getReactionCount(post: Queja, type: string): number {
    return post.reactions?.counts?.[type] ?? 0;
  }

  getShowComments(post: Queja): boolean {
    return !!post.showComments;
  }

  getCommentAuthor(comment: any): string {
    return `${comment.author?.nombre || ''} ${comment.author?.apellido || ''}`.trim() || 'Usuario';
  }

  getCommentText(comment: any): string {
    return comment.texto || '';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'hace unos minutos';
    if (diffInHours < 24) return `hace ${diffInHours} horas`;
    if (diffInHours < 48) return 'hace 1 día';
    return `hace ${Math.floor(diffInHours / 24)} días`;
  }

  trackByPostId(index: number, post: Queja): string {
    return post.id;
  }

  trackByComment(index: number, comment: any): string {
    return comment.id;
  }

  get displayedPosts(): Queja[] {
    return this.searchTerm || this.selectedCategory || this.selectedStatus 
      ? this.filteredPosts 
      : this.posts;
  }

  getBookmarkText(post: Queja): string {
    return (post as any).meta?.saved ? 'Quitar de guardados' : 'Guardar';
  }
}
