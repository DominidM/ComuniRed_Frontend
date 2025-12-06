import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuejaService, Queja, Usuario } from '../../services/queja.service';
import { ReaccionService } from '../../services/reaccion.service';
import { ComentarioService, Comentario } from '../../services/comentario.service';
import { CategoriaService, Categoria } from '../../services/categoria.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-trending',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.css']
})
export class TrendingComponent implements OnInit {
  Math = Math;
  
  posts: Queja[] = [];
  filteredPosts: Queja[] = [];
  loading = false;
  
  user: { id?: string; name: string; avatarUrl: string } | null = null;
  
  categorias: any[] = [];
  selectedCategory = '';
  sortBy: 'recent' | 'popular' | 'votes' = 'popular';
  
  showReactionMenu: { [postId: string]: boolean } = {};
  showCommentMenuModal: { [commentId: string]: boolean } = {};
  showCommentsInline: { [postId: string]: boolean } = {};
  
  // Modales
  showCommentsModal = false;
  showEditModal = false;
  
  // Comentarios
  selectedReporteForComments: Queja | null = null;
  newCommentText = '';
  editingCommentId: string | null = null;
  editingCommentText = '';
  
  // Edición de queja
  editingQueja: Queja | null = null;
  
  // Toast
  toastMessage = '';
  showToast = false;
  
  // Paginación
  currentPage = 1;
  reportsPerPage = 10;
  totalReports = 0;
  
  // Vista actual
  currentView: 'populares' | 'recientes' | 'categorias' = 'populares';
  selectedPeriodo = 7;
  selectedCategoryName = '';
  
  // Stats
  stats = {
    reportePopular: '-',
    reportesEstaSemana: 0,
    categoriaTop: '-',
    totalReportes: 0
  };

  constructor(
    private router: Router,
    private quejaService: QuejaService,
    private reaccionService: ReaccionService,
    private comentarioService: ComentarioService,
    private categoriaService: CategoriaService,
    private usuarioService: UsuarioService
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.closeAllReactionMenus();
  }

  ngOnInit(): void {
    this.loadUser();
    this.loadCategorias();
    this.cargarReportes();
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
        this.categorias = page.content
          .filter(c => c.activo)
          .map(cat => ({
            ...cat,
            count: 0,
            icon: 'bi-tag',
            description: cat.descripcion || 'Sin descripción'
          }));
      },
      error: (err) => {
        console.error('Error cargando categorías', err);
        this.categorias = [];
      }
    });
  }

  cargarReportes(): void {
    if (!this.user?.id) return;
    
    this.loading = true;
    this.quejaService.obtenerQuejas(this.user.id).subscribe({
      next: (quejas) => {
        this.posts = JSON.parse(JSON.stringify(quejas)).map((q: any) => {
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
            userVote: q.userVote || null,
            canVote: q.canVote !== undefined ? q.canVote : !q.userVote,
            showComments: false,
            showMenu: false,
            comments: q.comments || [],
            commentsCount: q.commentsCount || 0
          };
        });
        
        this.updateStats();
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error cargando quejas:', err);
        this.loading = false;
        this.showToastMessage('Error al cargar reportes');
      }
    });
  }

  updateStats(): void {
    this.stats.totalReportes = this.posts.length;
    
    if (this.posts.length > 0) {
      const sorted = [...this.posts].sort((a, b) => 
        (b.reactions?.total || 0) - (a.reactions?.total || 0)
      );
      this.stats.reportePopular = sorted[0]?.titulo.substring(0, 20) + '...' || '-';
      
      const categoryCounts: { [key: string]: number } = {};
      this.posts.forEach(p => {
        const catName = p.categoria?.nombre || 'Sin categoría';
        categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
      });
      
      const topCat = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
      this.stats.categoriaTop = topCat ? topCat[0] : '-';
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      this.stats.reportesEstaSemana = this.posts.filter(p => 
        new Date(p.fecha_creacion) > weekAgo
      ).length;
    }
  }

  applyFilters(): void {
    let filtered = [...this.posts];

    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.categoria?.id === this.selectedCategory);
    }

    filtered = this.sortPosts(filtered);

    this.filteredPosts = filtered;
    this.currentPage = 1;
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

  onCategoryFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.sortBy = 'popular';
    this.applyFilters();
  }

  // ============================================
  // VISTAS Y NAVEGACIÓN
  // ============================================

  changeView(view: 'populares' | 'recientes' | 'categorias'): void {
    this.currentView = view;
    if (view === 'populares') {
      this.sortBy = 'popular';
    } else if (view === 'recientes') {
      this.sortBy = 'recent';
    }
    this.applyFilters();
  }

  isViewActive(view: string): boolean {
    return this.currentView === view;
  }

  hasActiveFilter(): boolean {
    return !!this.selectedCategory;
  }

  clearCategoryFilter(): void {
    this.selectedCategory = '';
    this.selectedCategoryName = '';
    this.applyFilters();
  }

  cambiarPeriodo(dias: number): void {
    this.selectedPeriodo = dias;
    // Aquí puedes agregar lógica para filtrar por período
  }

  getPeriodoTexto(): string {
    if (this.selectedPeriodo === 7) return 'Esta semana';
    if (this.selectedPeriodo === 15) return 'Últimos 15 días';
    return 'Este mes';
  }

  verCategoria(categoria: any): void {
    this.selectedCategory = categoria.id;
    this.selectedCategoryName = categoria.nombre;
    this.currentView = 'populares';
    this.applyFilters();
  }

  getReportes(): Queja[] {
    return this.selectedCategory ? this.filteredPosts : this.posts;
  }

  // ============================================
  // VOTACIÓN
  // ============================================

  isQuejaEnVotacion(post: Queja): boolean {
    return post.estado?.clave === 'votacion';
  }

  hasVotes(post: Queja): boolean {
    return !!post.votes;
  }

  canVote(post: Queja): boolean {
    return !post.userVote && this.isQuejaEnVotacion(post);
  }

  getTotalVotes(post: Queja): number {
    return (post.votes?.yes || 0) + (post.votes?.no || 0);
  }

  getYesVotes(post: Queja): number {
    return post.votes?.yes || 0;
  }

  getNoVotes(post: Queja): number {
    return post.votes?.no || 0;
  }

  getVotingProgress(post: Queja): number {
    const total = this.getTotalVotes(post);
    return Math.min((total / 5) * 100, 100);
  }

  needsMoreVotes(post: Queja): boolean {
    return this.getTotalVotes(post) < 5;
  }

  getVotesNeeded(post: Queja): number {
    return Math.max(0, 5 - this.getTotalVotes(post));
  }

  vote(post: Queja, voteType: 'accept' | 'reject'): void {
    if (!this.user?.id || !this.canVote(post)) {
      return;
    }

    const voteValue = voteType === 'accept' ? 'YES' : 'NO';
    
    const previousVotes = { ...post.votes };
    const previousUserVote = post.userVote;

    if (voteType === 'accept') {
      post.votes.yes = (post.votes.yes || 0) + 1;
    } else {
      post.votes.no = (post.votes.no || 0) + 1;
    }
    post.votes.total = (post.votes.yes || 0) + (post.votes.no || 0);
    post.userVote = voteValue;

    this.quejaService.votarQueja(post.id, this.user.id, voteValue).subscribe({
      next: (updatedQueja) => {
        post.votes = updatedQueja.votes;
        post.userVote = updatedQueja.userVote;
        post.canVote = updatedQueja.canVote;
        this.showToastMessage('Voto registrado exitosamente');
      },
      error: (err: any) => {
        console.error('Error al votar:', err);
        post.votes = previousVotes;
        post.userVote = previousUserVote;
        this.showToastMessage('Error al registrar el voto');
      }
    });
  }

  // ============================================
  // ESTADOS
  // ============================================

  isQuejaEnProceso(post: Queja): boolean {
    return post.estado?.clave === 'en_proceso';
  }

  isQuejaResuelta(post: Queja): boolean {
    return post.estado?.clave === 'resuelto' || post.estado?.clave === 'resuelta';
  }

  isQuejaPendiente(post: Queja): boolean {
    return post.estado?.clave === 'pendiente' || post.estado?.clave === 'aprobada';
  }

  // ============================================
  // REACCIONES
  // ============================================

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
        this.applyFilters();
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

  getReactionIcon(reaction: string): string {
    const icons: { [key: string]: string } = {
      like: '❤️',
      love: '😍',
      wow: '😮',
      helpful: '👍',
      dislike: '👎'
    };
    return icons[reaction] || '👍';
  }

  // ============================================
  // COMENTARIOS
  // ============================================

  getCommentsCount(reporte: Queja): number {
    return reporte.commentsCount || (reporte.comments || []).length;
  }

  getPreviewComments(reporte: Queja): any[] {
    return (reporte.comments || []).slice(0, 3);
  }

  hasMoreComments(reporte: Queja): boolean {
    return this.getCommentsCount(reporte) > 3;
  }

  canEditComment(comment: any): boolean {
    return comment.author?.id === this.user?.id;
  }

  getCommentAuthor(comment: any): string {
    return `${comment.author?.nombre || ''} ${comment.author?.apellido || ''}`.trim() || 'Usuario';
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

  addCommentInline(reporte: Queja, inputElement: HTMLInputElement): void {
    const text = inputElement.value.trim();
    if (!text || !this.user?.id) return;

    const tempComment = {
      id: 'temp-' + Date.now(),
      texto: text,
      author: {
        id: this.user.id,
        nombre: this.user.name.split(' ')[0] || 'Usuario',
        apellido: this.user.name.split(' ')[1] || '',
        foto_perfil: this.user.avatarUrl
      },
      fecha_creacion: new Date().toISOString(),
      showMenu: false
    };

    if (!Array.isArray(reporte.comments)) {
      reporte.comments = [];
    }

    reporte.comments = [...reporte.comments, tempComment as any];
    reporte.commentsCount = reporte.comments.length;
    inputElement.value = '';

    this.comentarioService.agregarComentario(reporte.id, this.user.id, text).subscribe({
      next: (newComment) => {
        const commentIndex = reporte.comments.findIndex(c => c.id === tempComment.id);
        if (commentIndex !== -1) {
          reporte.comments = [
            ...reporte.comments.slice(0, commentIndex),
            newComment,
            ...reporte.comments.slice(commentIndex + 1)
          ];
        }
        this.showToastMessage('Comentario agregado');
      },
      error: (err: any) => {
        console.error('Error al comentar', err);
        reporte.comments = reporte.comments.filter(c => c.id !== tempComment.id);
        reporte.commentsCount = reporte.comments.length;
        this.showToastMessage('Error al agregar comentario');
      }
    });
  }

  deleteCommentInline(reporte: Queja, comment: any): void {
    if (!this.user?.id || !confirm('¿Eliminar este comentario?')) return;

    this.comentarioService.eliminarComentario(comment.id, this.user.id).subscribe({
      next: () => {
        reporte.comments = reporte.comments.filter(c => c.id !== comment.id);
        reporte.commentsCount = reporte.comments.length;
        this.showToastMessage('Comentario eliminado');
      },
      error: (err: any) => {
        console.error('Error al eliminar comentario', err);
        this.showToastMessage('Error al eliminar comentario');
      }
    });
  }

  openCommentsModal(reporte: Queja): void {
    this.selectedReporteForComments = reporte;
    this.showCommentsModal = true;
  }

  closeCommentsModal(): void {
    this.showCommentsModal = false;
    this.selectedReporteForComments = null;
    this.newCommentText = '';
    this.editingCommentId = null;
    this.editingCommentText = '';
  }

  addComment(): void {
    if (!this.newCommentText.trim() || !this.selectedReporteForComments || !this.user?.id) return;

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

    if (!Array.isArray(this.selectedReporteForComments.comments)) {
      this.selectedReporteForComments.comments = [];
    }

    this.selectedReporteForComments.comments = [...this.selectedReporteForComments.comments, tempComment as any];
    this.selectedReporteForComments.commentsCount = this.selectedReporteForComments.comments.length;

    const commentText = this.newCommentText.trim();
    this.newCommentText = '';

    this.comentarioService.agregarComentario(this.selectedReporteForComments.id, this.user.id, commentText).subscribe({
      next: (newComment) => {
        if (this.selectedReporteForComments) {
          const commentIndex = this.selectedReporteForComments.comments.findIndex(c => c.id === tempComment.id);
          if (commentIndex !== -1) {
            this.selectedReporteForComments.comments = [
              ...this.selectedReporteForComments.comments.slice(0, commentIndex),
              newComment,
              ...this.selectedReporteForComments.comments.slice(commentIndex + 1)
            ];
          }
        }
        this.showToastMessage('Comentario agregado');
      },
      error: (err: any) => {
        console.error('Error al comentar', err);
        if (this.selectedReporteForComments) {
          this.selectedReporteForComments.comments = this.selectedReporteForComments.comments.filter(c => c.id !== tempComment.id);
          this.selectedReporteForComments.commentsCount = this.selectedReporteForComments.comments.length;
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
    if (!this.editingCommentId || !this.editingCommentText.trim() || !this.selectedReporteForComments || !this.user?.id) return;

    const commentIndex = this.selectedReporteForComments.comments.findIndex(c => c.id === this.editingCommentId);
    if (commentIndex !== -1) {
      const previousText = this.selectedReporteForComments.comments[commentIndex].texto;

      this.selectedReporteForComments.comments = [
        ...this.selectedReporteForComments.comments.slice(0, commentIndex),
        {
          ...this.selectedReporteForComments.comments[commentIndex],
          texto: this.editingCommentText.trim(),
          fecha_modificacion: new Date().toISOString()
        } as any,
        ...this.selectedReporteForComments.comments.slice(commentIndex + 1)
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
          if (this.selectedReporteForComments) {
            this.selectedReporteForComments.comments = [
              ...this.selectedReporteForComments.comments.slice(0, commentIndex),
              {
                ...this.selectedReporteForComments.comments[commentIndex],
                texto: previousText
              },
              ...this.selectedReporteForComments.comments.slice(commentIndex + 1)
            ];
          }
          this.showToastMessage('Error al actualizar comentario');
        }
      });
    }
  }

  deleteComment(comment: any): void {
    if (!this.user?.id || !this.selectedReporteForComments || !confirm('¿Eliminar este comentario?')) return;

    this.comentarioService.eliminarComentario(comment.id, this.user.id).subscribe({
      next: () => {
        if (this.selectedReporteForComments) {
          this.selectedReporteForComments.comments = this.selectedReporteForComments.comments.filter(c => c.id !== comment.id);
          this.selectedReporteForComments.commentsCount = this.selectedReporteForComments.comments.length;
        }
        this.showToastMessage('Comentario eliminado');
      },
      error: (err: any) => {
        console.error('Error al eliminar comentario', err);
        this.showToastMessage('Error al eliminar comentario');
      }
    });
  }

  // ============================================
  // EDITAR/ELIMINAR QUEJA
  // ============================================

  canEditQueja(reporte: Queja): boolean {
    return reporte.usuario?.id === this.user?.id;
  }

  togglePostMenu(reporte: Queja): void {
    reporte.showMenu = !reporte.showMenu;
  }

  openEditQueja(reporte: Queja): void {
    this.editingQueja = JSON.parse(JSON.stringify(reporte));
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
          this.posts[index] = { 
            ...updated, 
            showMenu: false,
            fue_editado: true,
            comments: this.posts[index].comments || []
          };
        }
        this.closeEditModal();
        this.loading = false;
        this.applyFilters();
        this.showToastMessage('Reporte actualizado');
      },
      error: (err: any) => {
        console.error('Error al actualizar queja', err);
        this.loading = false;
        this.showToastMessage('Error al actualizar reporte');
      }
    });
  }

  deleteQueja(reporte: Queja): void {
    if (!this.user?.id || !confirm('¿Eliminar este reporte permanentemente?')) return;

    this.loading = true;

    this.quejaService.eliminarQueja(reporte.id, this.user.id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== reporte.id);
        this.applyFilters();
        this.loading = false;
        this.showToastMessage('Reporte eliminado');
      },
      error: (err: any) => {
        console.error('Error al eliminar queja', err);
        this.loading = false;
        this.showToastMessage('Error al eliminar reporte');
      }
    });
  }

  // ============================================
  // PAGINACIÓN
  // ============================================

  getPaginatedReportes(): Queja[] {
    const posts = this.getReportes();
    this.totalReports = posts.length;
    const startIndex = (this.currentPage - 1) * this.reportsPerPage;
    const endIndex = startIndex + this.reportsPerPage;
    return posts.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalReports / this.reportsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      } else if (this.currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }
    
    return pages;
  }

  // ============================================
  // UTILIDADES
  // ============================================

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

  hasImage(reporte: Queja): boolean {
    return !!(reporte.imagen_url || (reporte.evidence && reporte.evidence.length > 0));
  }

  getImageUrl(reporte: Queja): string {
    return reporte.imagen_url || reporte.evidence?.[0]?.url || '';
  }

  getEstadoClass(estado: string): string {
    const estadoMap: { [key: string]: string } = {
      'Pendiente': 'estado-pendiente',
      'En Proceso': 'estado-proceso',
      'Resuelta': 'estado-resuelta',
      'Rechazada': 'estado-rechazada',
      'En Votación': 'estado-votacion'
    };
    return estadoMap[estado] || 'estado-pendiente';
  }

  getCategoryName(post: Queja): string {
    return post.categoria?.nombre || 'Sin categoría';
  }

  get displayedPosts(): Queja[] {
    return this.selectedCategory ? this.filteredPosts : this.posts;
  }

  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  trackByComment(index: number, comment: any): string {
    return comment.id;
  }

  trackByPostId(index: number, post: Queja): string {
    return post.id;
  }
}
