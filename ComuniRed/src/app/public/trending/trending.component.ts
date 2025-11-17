import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuejaService, Queja, Usuario } from '../../services/queja.service';
import { ReaccionService } from '../../services/reaccion.service';
import { CategoriaService, Categoria } from '../../services/categoria.service';
import { ComentarioService } from '../../services/comentario.service';
import { UsuarioService } from '../../services/usuario.service';

interface TrendingStats {
  totalReportes: number;
  categoriaTop: string;
  reportePopular: string;
  reportesEstaSemana: number;
}

interface CategoriaConConteo extends Categoria {
  count: number;
  icon: string;
  description: string;
}

type PeriodoTiempo = 7 | 15 | 30;

@Component({
  selector: 'app-trending',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.css']
})
export class TrendingComponent implements OnInit {

  Math = Math;

  currentView: 'populares' | 'recientes' | 'categorias' = 'populares';
  loading = false;
  user: { id?: string; name: string; avatarUrl: string } | null = null;
  
  reportesPopulares: Queja[] = [];
  reportesRecientes: Queja[] = [];
  categorias: CategoriaConConteo[] = [];
  todasLasQuejas: Queja[] = [];
  
  selectedCategoryId: string | null = null;
  selectedCategoryName: string = '';
  selectedPeriodo: PeriodoTiempo = 7;
  
  showCommentsModal = false;
  selectedReporteForComments: Queja | null = null;
  newCommentText = '';
  
  editingCommentId: string | null = null;
  editingCommentText = '';
  
  showEditModal = false;
  editingQueja: Queja | null = null;
  
  stats: TrendingStats = {
    totalReportes: 0,
    categoriaTop: 'Cargando...',
    reportePopular: 'Cargando...',
    reportesEstaSemana: 0
  };
  
  toastMessage = '';
  showToast = false;

  // ✅ NUEVAS PROPIEDADES
  showReactionMenu: { [postId: string]: boolean } = {};
  commentPages: { [postId: string]: number } = {};
  commentsPerPage = 10;
  initialCommentsToLoad = 20;
  showCommentsInline: { [postId: string]: boolean } = {};

  currentPage = 1;
  reportsPerPage = 10;
  totalReports = 0;

  

  private categoriaIcons: { [key: string]: string } = {
    'Vías': 'bi-sign-stop',
    'Baches': 'bi-sign-stop',
    'Alumbrado': 'bi-lightbulb',
    'Alumbrado Público': 'bi-lightbulb',
    'Agua y Saneamiento': 'bi-droplet',
    'Agua': 'bi-droplet',
    'Alcantarillado': 'bi-droplet',
    'Limpieza': 'bi-trash',
    'Basura': 'bi-trash',
    'Seguridad': 'bi-shield-exclamation',
    'Señalización': 'bi-exclamation-triangle',
    'Tránsito': 'bi-exclamation-triangle'
  };

  constructor(
    private quejaService: QuejaService,
    private reaccionService: ReaccionService,
    private categoriaService: CategoriaService,
    private comentarioService: ComentarioService,
    private usuarioService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.closeAllReactionMenus();
  }

  ngOnInit(): void {
    this.loadUser();
    this.loadData();
    
    this.route.queryParams.subscribe(params => {
      if (params['categoria']) {
        this.selectedCategoryId = params['categoria'];
        this.currentView = 'populares';
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

  loadData(): void {
    if (!this.user?.id) return;

    this.loading = true;
    
    this.quejaService.obtenerQuejas(this.user.id).subscribe({
      next: (quejas) => {
        const quejasClonadas = JSON.parse(JSON.stringify(quejas));
        const quejasRecientes = this.filtrarPorPeriodo(quejasClonadas);
        
        this.todasLasQuejas = quejasRecientes.map((q: any) => ({ 
          ...q, 
          showMenu: false,
          comments: Array.isArray(q.comments) ? [...q.comments] : []
        }));
        
        this.processQuejas(this.todasLasQuejas);
        this.loadCategorias();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error cargando quejas:', err);
        this.loading = false;
      }
    });
  }

  filtrarPorPeriodo(quejas: Queja[]): Queja[] {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - this.selectedPeriodo);
    return quejas.filter(q => new Date(q.fecha_creacion) >= fechaLimite);
  }

  cambiarPeriodo(dias: PeriodoTiempo): void {
    this.selectedPeriodo = dias;
    this.loadData();
    const periodoTexto = dias === 7 ? 'última semana' : dias === 15 ? 'últimos 15 días' : 'último mes';
    this.showToastMessage(`Mostrando reportes de ${periodoTexto}`);
  }

  getPeriodoTexto(): string {
    switch (this.selectedPeriodo) {
      case 7: return 'la última semana';
      case 15: return 'los últimos 15 días';
      case 30: return 'el último mes';
      default: return 'la última semana';
    }
  }

  loadCategorias(): void {
    this.categoriaService.obtenerCategorias(0, 100).subscribe({
      next: (page) => this.processCategorias(page.content),
      error: (err: any) => console.error('Error cargando categorías:', err)
    });
  }

  processQuejas(quejas: Queja[]): void {
    const unaSemanaAtras = new Date();
    unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);
    
    this.reportesRecientes = [...quejas].sort((a, b) => 
      new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
    );

    this.reportesPopulares = [...quejas].sort((a, b) => 
      (b.reactions?.total || 0) - (a.reactions?.total || 0)
    );

    this.stats.totalReportes = quejas.length;
    this.stats.reportesEstaSemana = quejas.filter(q => 
      new Date(q.fecha_creacion) > unaSemanaAtras
    ).length;

    const categoriaCounts: { [key: string]: number } = {};
    quejas.forEach(q => {
      const catName = q.categoria?.nombre || 'Sin categoría';
      categoriaCounts[catName] = (categoriaCounts[catName] || 0) + 1;
    });

    const topCategoria = Object.entries(categoriaCounts).sort((a, b) => b[1] - a[1])[0];
    this.stats.categoriaTop = topCategoria ? topCategoria[0] : 'N/A';

    if (this.reportesPopulares.length > 0) {
      this.stats.reportePopular = this.reportesPopulares[0].titulo;
    }
  }

  processCategorias(categorias: Categoria[]): void {
    const categoriaCounts: { [key: string]: number } = {};
    
    this.todasLasQuejas.forEach(q => {
      const catId = q.categoria?.id;
      if (catId) categoriaCounts[catId] = (categoriaCounts[catId] || 0) + 1;
    });

    this.categorias = categorias
      .filter(c => c.activo)
      .map(cat => ({
        ...cat,
        count: categoriaCounts[cat.id] || 0,
        icon: this.getCategoryIcon(cat.nombre),
        description: this.getCategoryDescription(cat.nombre)
      }))
      .sort((a, b) => b.count - a.count);
  }

  getCategoryIcon(nombre: string): string {
    return this.categoriaIcons[nombre] || 'bi-folder';
  }

  getCategoryDescription(nombre: string): string {
    const descriptions: { [key: string]: string } = {
      'Vías': 'Problemas en el pavimento',
      'Baches': 'Problemas en el pavimento',
      'Alumbrado': 'Fallos en iluminación',
      'Alumbrado Público': 'Fallos en iluminación',
      'Agua y Saneamiento': 'Problemas de drenaje',
      'Agua': 'Problemas de agua potable',
      'Alcantarillado': 'Problemas de drenaje',
      'Limpieza': 'Acumulación de residuos',
      'Basura': 'Acumulación de residuos',
      'Seguridad': 'Problemas de seguridad',
      'Señalización': 'Señales deterioradas',
      'Tránsito': 'Problemas de tráfico'
    };
    return descriptions[nombre] || 'Reportes varios';
  }

  changeView(view: 'populares' | 'recientes' | 'categorias'): void {
    this.currentView = view;
    this.currentPage = 1;
    if (view === 'categorias') this.clearCategoryFilter();
  }


  isViewActive(view: string): boolean {
    return this.currentView === view;
  }

  getReportes(): Queja[] {
    let reportes = this.currentView === 'recientes' ? this.reportesRecientes : this.reportesPopulares;
    if (this.selectedCategoryId) {
      reportes = reportes.filter(r => r.categoria.id === this.selectedCategoryId);
    }
    return reportes;
  }

  verCategoria(categoria: CategoriaConConteo): void {
    this.selectedCategoryId = categoria.id;
    this.selectedCategoryName = categoria.nombre;
    this.currentView = 'populares';
    this.showToastMessage(`Filtrando por: ${categoria.nombre}`);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: categoria.id },
      queryParamsHandling: 'merge'
    });
  }

  clearCategoryFilter(): void {
    this.selectedCategoryId = null;
    this.selectedCategoryName = '';
    this.currentPage = 1;
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }


  hasActiveFilter(): boolean {
    return !!this.selectedCategoryId;
  }

  // ==================== REACCIONES ====================
  toggleReactionMenu(postId: string, event: Event): void {
    event.stopPropagation();
    Object.keys(this.showReactionMenu).forEach(key => {
      if (key !== postId) this.showReactionMenu[key] = false;
    });
    this.showReactionMenu[postId] = !this.showReactionMenu[postId];
  }

  closeAllReactionMenus(): void {
    this.showReactionMenu = {};
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
      next: (updated) => post.reactions = updated,
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
  toggleCommentsInline(postId: string): void {
    this.showCommentsInline[postId] = !this.showCommentsInline[postId];
    if (!this.commentPages[postId]) {
      this.commentPages[postId] = 2; // Cargar primeros 20 (2 páginas de 10)
    }
  }

  addCommentInline(post: Queja, inputElement: HTMLInputElement): void {
    const text = inputElement.value;
    if (!text?.trim() || !this.user?.id) return;

    const tempComment = {
      id: 'temp-' + Date.now(),
      texto: text.trim(),
      author: {
        id: this.user.id,
        nombre: this.user.name.split(' ')[0] || 'Usuario',
        apellido: this.user.name.split(' ')[1] || '',
        foto_perfil: this.user.avatarUrl
      },
      fecha_creacion: new Date().toISOString(),
      fecha_modificacion: undefined
    };

    if (!Array.isArray(post.comments)) {
      post.comments = [];
    }

    post.comments = [...post.comments, tempComment as any];
    post.commentsCount = post.comments.length;
    inputElement.value = '';

    this.comentarioService.agregarComentario(post.id, this.user.id, text.trim()).subscribe({
      next: (newComment) => {
        const commentIndex = post.comments.findIndex(c => c.id === tempComment.id);
        if (commentIndex !== -1) {
          post.comments = [
            ...post.comments.slice(0, commentIndex),
            newComment,
            ...post.comments.slice(commentIndex + 1)
          ];
        }
        this.showToastMessage('Comentario agregado');
      },
      error: (err: any) => {
        console.error('Error al comentar', err);
        post.comments = post.comments.filter(c => c.id !== tempComment.id);
        post.commentsCount = post.comments.length;
        this.showToastMessage('Error al agregar comentario');
      }
    });
  }

  getVisibleComments(post: Queja): any[] {
    if (!post.comments) return [];
    const page = this.commentPages[post.id] || 2;
    return post.comments.slice(0, page * this.commentsPerPage);
  }

  hasMoreCommentsToLoad(post: Queja): boolean {
    if (!post.comments) return false;
    const page = this.commentPages[post.id] || 2;
    return post.comments.length > page * this.commentsPerPage;
  }

  loadMoreComments(post: Queja): void {
    const currentPage = this.commentPages[post.id] || 2;
    this.commentPages[post.id] = currentPage + 1;
  }

  startEditCommentInline(post: Queja, comment: any): void {
    this.editingCommentId = comment.id;
    this.editingCommentText = comment.texto;
  }

  saveEditCommentInline(post: Queja): void {
    if (!this.editingCommentId || !this.editingCommentText.trim() || !this.user?.id) return;

    const commentIndex = post.comments.findIndex(c => c.id === this.editingCommentId);
    if (commentIndex !== -1) {
      const previousText = post.comments[commentIndex].texto;

      post.comments = [
        ...post.comments.slice(0, commentIndex),
        {
          ...post.comments[commentIndex],
          texto: this.editingCommentText.trim(),
          fecha_modificacion: new Date().toISOString()
        } as any,
        ...post.comments.slice(commentIndex + 1)
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
          post.comments = [
            ...post.comments.slice(0, commentIndex),
            {
              ...post.comments[commentIndex],
              texto: previousText
            },
            ...post.comments.slice(commentIndex + 1)
          ];
          this.showToastMessage('Error al actualizar comentario');
        }
      });
    }
  }

  deleteCommentInline(post: Queja, comment: any): void {
    if (!this.user?.id || !confirm('¿Eliminar este comentario?')) return;

    this.comentarioService.eliminarComentario(comment.id, this.user.id).subscribe({
      next: () => {
        post.comments = post.comments.filter(c => c.id !== comment.id);
        post.commentsCount = post.comments.length;
        this.showToastMessage('Comentario eliminado');
      },
      error: (err: any) => {
        console.error('Error al eliminar comentario', err);
        this.showToastMessage('Error al eliminar comentario');
      }
    });
  }

  // ==================== MODAL COMENTARIOS ====================
  openCommentsModal(reporte: Queja): void {
    this.selectedReporteForComments = JSON.parse(JSON.stringify(reporte));
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
      fecha_creacion: new Date().toISOString()
    };

    if (!Array.isArray(this.selectedReporteForComments.comments)) {
      this.selectedReporteForComments.comments = [];
    }

    this.selectedReporteForComments.comments = [...this.selectedReporteForComments.comments, tempComment as any];
    this.selectedReporteForComments.commentsCount = this.selectedReporteForComments.comments.length;

    const quejaIndex = this.todasLasQuejas.findIndex(q => q.id === this.selectedReporteForComments!.id);
    if (quejaIndex !== -1) {
      this.todasLasQuejas[quejaIndex] = {
        ...this.todasLasQuejas[quejaIndex],
        comments: [...this.selectedReporteForComments.comments],
        commentsCount: this.selectedReporteForComments.commentsCount
      };
      this.processQuejas(this.todasLasQuejas);
    }

    const commentText = this.newCommentText.trim();
    this.newCommentText = '';

    this.comentarioService.agregarComentario(
      this.selectedReporteForComments.id, 
      this.user.id, 
      commentText
    ).subscribe({
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
    if (!this.editingCommentId || !this.editingCommentText.trim() || !this.selectedReporteForComments) return;

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
        this.user!.id!,
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

  canEditComment(comment: any): boolean {
    return comment.author?.id === this.user?.id;
  }

  // ==================== EDITAR REPORTE ====================
  togglePostMenu(post: Queja): void {
    post.showMenu = !post.showMenu;
    this.closeAllReactionMenus();
  }

  openEditQueja(queja: Queja): void {
    this.editingQueja = JSON.parse(JSON.stringify(queja));
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
        const index = this.todasLasQuejas.findIndex(q => q.id === updated.id);
        if (index !== -1) {
          this.todasLasQuejas[index] = { 
            ...updated, 
            showMenu: false,
            fue_editado: true 
          };
          this.processQuejas(this.todasLasQuejas);
        }
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

  deleteQueja(queja: Queja): void {
    if (!this.user?.id || !confirm('¿Eliminar este reporte permanentemente?')) return;

    this.loading = true;

    this.quejaService.eliminarQueja(queja.id, this.user.id).subscribe({
      next: () => {
        this.todasLasQuejas = this.todasLasQuejas.filter(q => q.id !== queja.id);
        this.processQuejas(this.todasLasQuejas);
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

  canEditQueja(queja: Queja): boolean {
    return queja.usuario?.id === this.user?.id;
  }

  // ==================== UTILIDADES ====================

  getPreviewComments(reporte: Queja): any[] {
    return (reporte.comments || []).slice(0, 3);
  }

  hasMoreComments(reporte: Queja): boolean {
    return (reporte.comments || []).length > 3;
  }

  
  getCommentsCount(reporte: Queja): number {
    return reporte.commentsCount || (reporte.comments || []).length;
  }

  toggleCommentMenu(commentId: string): void {
    if (this.editingCommentId === commentId) {
      this.editingCommentId = null;
    } else {
      this.editingCommentId = commentId;
    }
  }

  verPerfilUsuario(usuario: Usuario): void {
    if (!usuario?.id) return;
    if (usuario.id === this.user?.id) {
      this.router.navigate(['/public/profile']);
    } else {
      this.router.navigate(['/public/user-profile', usuario.id]);
    }
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

  getImageUrl(reporte: Queja): string {
    return reporte.imagen_url || reporte.evidence?.[0]?.url || 'assets/img/placeholder-report.jpg';
  }

  hasImage(reporte: Queja): boolean {
    return !!(reporte.imagen_url || (reporte.evidence && reporte.evidence.length > 0));
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

  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  trackByPostId(index: number, post: Queja): string {
    return post.id;
  }

  trackByComment(index: number, comment: any): string {
    return comment.id;
  }

    // ==================== PAGINACIÓN DE REPORTES ====================
  getPaginatedReportes(): Queja[] {
    const reportes = this.getReportes();
    this.totalReports = reportes.length;
    const startIndex = (this.currentPage - 1) * this.reportsPerPage;
    const endIndex = startIndex + this.reportsPerPage;
    return reportes.slice(startIndex, endIndex);
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
        pages.push(-1); // Ellipsis
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

}
