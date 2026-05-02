import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuejaService, Queja, Usuario } from '../../services/queja.service';
import { ReaccionService } from '../../services/reaccion.service';
import { ComentarioService } from '../../services/comentario.service';
import { CategoriaService, Categoria } from '../../services/categoria.service';
import { UsuarioService } from '../../services/usuario.service';
import {
  HistorialEventoService,
  HistorialEvento,
} from '../../services/historial-evento.service';
import { StoriesComponent } from '../stories/stories.component';
import { PostCardComponent } from './post-card/post-card.component';
import { CreateReportComponent } from './create-report/create-report.component';
import { CommentsComponent } from './comments/comments.component';
import { HistorialComponent } from './historial/historial.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StoriesComponent,
    PostCardComponent,
    CreateReportComponent,
    HistorialComponent,
  ],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css'],
})
export class FeedComponent implements OnInit, OnDestroy {
  user: { id?: string; name: string; avatarUrl: string } | null = null;
  posts: Queja[] = [];
  categorias: Categoria[] = [];
  loading = false;

  commentTexts: { [postId: string]: string } = {};
  showReactionMenu: { [postId: string]: boolean } = {};
  showCommentMenuModal: { [commentId: string]: boolean } = {};
  editingCommentId: string | null = null;
  editingCommentText = '';

  // Modales
  showCreateModal = false;
  showCommentsModal = false;
  showHistorialModal = false;
  selectedReporteForComments: Queja | null = null;
  selectedQuejaHistorial: Queja | null = null;
  historialEventos: HistorialEvento[] = [];
  loadingHistorial = false;
  newCommentText = '';

  showEditModal = false;
  editingQueja: Queja | null = null;

  // Paginación
  page = 0;
  pageSize = 5;
  allLoaded = false;
  loadingMore = false;
  skeletonItems = [1, 2, 3];

  toastMessage = '';
  showToast = false;

  private scrollContainer: HTMLElement | null = null;
  private boundOnScroll = this.onScroll.bind(this);

  constructor(
    private quejaService: QuejaService,
    private reaccionService: ReaccionService,
    private comentarioService: ComentarioService,
    private categoriaService: CategoriaService,
    private usuarioService: UsuarioService,
    private historialService: HistorialEventoService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showReactionMenu = {};
  }

  ngOnInit(): void {
    this.loadUser();
    this.loadCategorias();
    setTimeout(() => {
      this.scrollContainer = document.querySelector(
        'mat-sidenav-content',
      ) as HTMLElement;
      this.scrollContainer?.addEventListener('scroll', this.boundOnScroll);
    }, 0);
  }

  ngOnDestroy(): void {
    this.scrollContainer?.removeEventListener('scroll', this.boundOnScroll);
  }

  private onScroll(): void {
    if (this.loadingMore || this.allLoaded || !this.scrollContainer) return;
    const { scrollTop, scrollHeight, clientHeight } = this.scrollContainer;
    if (scrollHeight - scrollTop <= clientHeight + 400) this.loadPosts();
  }

  loadUser(): void {
    const u = this.usuarioService.getUser() as any;
    console.log('👤 Usuario del localStorage:', u);

    if (u) {
      this.user = {
        id: u.id || u._id,
        name: `${u.nombre || ''} ${u.apellido || ''}`.trim() || 'Usuario',
        avatarUrl: u.foto_perfil || 'assets/img/default-avatar.png',
      };
      console.log('👤 User seteado:', this.user);
    } else {
      console.warn('⚠️ No hay usuario en localStorage — redirigir a login?');
    }

    this.loadPosts();
  }

  loadCategorias(): void {
    this.categoriaService.obtenerCategorias(0, 100).subscribe({
      next: (p) => {
        this.categorias = p.content.filter((c: Categoria) => c.activo);
      },
      error: () => {},
    });
  }

  loadPosts(reset = false): void {
    if (reset) {
      this.page = 0;
      this.posts = [];
      this.allLoaded = false;
    }
    if (this.allLoaded || this.loadingMore) return;

    this.loadingMore = true;
    console.log(
      '📤 Cargando posts — página:',
      this.page,
      '| userId:',
      this.user?.id,
    );

    this.quejaService
      .obtenerQuejasPaginadas(this.user?.id || '', this.page, this.pageSize)
      .subscribe({
        next: (pageData) => {
          console.log('📥 Respuesta del backend:', pageData);
          console.log('📥 Content:', pageData?.content);
          console.log('📥 Total:', pageData?.totalElements);

          if (!pageData || !pageData.content) {
            console.warn('⚠️ pageData vacío o sin content');
            this.loadingMore = false;
            return;
          }

          const newPosts = pageData.content.map((q: any) => ({
            ...q,
            reactions: {
              total: q.reactions?.total || 0,
              userReaction: q.reactions?.userReaction || undefined,
              counts: {
                like: q.reactions?.counts?.like || 0,
                love: q.reactions?.counts?.love || 0,
                wow: q.reactions?.counts?.wow || 0,
                helpful: q.reactions?.counts?.helpful || 0,
                dislike: q.reactions?.counts?.dislike || 0,
                report: q.reactions?.counts?.report || 0,
              },
            },
            votes: {
              yes: q.votes?.yes || 0,
              no: q.votes?.no || 0,
              total: q.votes?.total || 0,
            },
            showComments: false,
            showMenu: false,
            comments: [],
            commentsCount: q.commentsCount || 0,
          }));

          console.log('✅ Posts mapeados:', newPosts.length);

          this.posts = [...this.posts, ...newPosts];
          this.allLoaded = pageData.last === true || newPosts.length === 0;
          this.page++;
          this.loadingMore = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error cargando posts:', err);
          console.error('❌ Error message:', err?.message);
          console.error('❌ GraphQL errors:', err?.graphQLErrors);
          console.error('❌ Network error:', err?.networkError);
          this.loadingMore = false;
        },
      });
  }

  // ── Reacciones ────────────────────────────────────────────────
  onReactionMenuToggle(e: { postId: string; event: Event }): void {
    e.event.stopPropagation();
    const open = !this.showReactionMenu[e.postId];
    this.showReactionMenu = {};
    this.showReactionMenu[e.postId] = open;
  }

  onReactionToggled(e: { post: Queja; type: string }): void {
    if (!this.user?.id) return;
    const { post, type } = e;
    const prev = post.reactions.userReaction;

    // Optimistic update
    if (prev === type) {
      post.reactions.counts[type] = Math.max(
        0,
        (post.reactions.counts[type] ?? 0) - 1,
      );
      post.reactions.userReaction = undefined;
    } else {
      if (prev) {
        post.reactions.counts[prev] = Math.max(
          0,
          (post.reactions.counts[prev] ?? 0) - 1,
        );
      }
      post.reactions.counts[type] = (post.reactions.counts[type] ?? 0) + 1;
      post.reactions.userReaction = type;
    }
    post.reactions.total = Object.values(post.reactions.counts).reduce(
      (s: number, v) => s + (v ?? 0),
      0,
    );

    // El service espera tipoReaccion como segundo parámetro
    this.reaccionService.toggleReaccion(post.id, type, this.user.id).subscribe({
      next: (updated) => {
        post.reactions = updated;
        this.cdr.detectChanges();
      },
      error: () => {
        // Revierte optimistic
        if (prev === type) {
          post.reactions.counts[type] = (post.reactions.counts[type] ?? 0) + 1;
          post.reactions.userReaction = prev;
        } else {
          post.reactions.counts[type] = Math.max(
            0,
            (post.reactions.counts[type] ?? 0) - 1,
          );
          if (prev)
            post.reactions.counts[prev] =
              (post.reactions.counts[prev] ?? 0) + 1;
          post.reactions.userReaction = prev;
        }
        this.toast('Error al reaccionar');
      },
    });
  }

  onVoted(e: { post: Queja; choice: 'accept' | 'reject' }): void {
    const { post, choice } = e;
    if (!post.canVote || !this.user?.id) return;

    // Optimistic update
    if (choice === 'accept') post.votes.yes++;
    else post.votes.no++;
    post.votes.total = post.votes.yes + post.votes.no;
    post.canVote = false;

    // USA votarQueja — NO toggleReaccion
    const voto = choice === 'accept' ? 'SI' : 'NO';
    this.quejaService.votarQueja(post.id, this.user.id, voto).subscribe({
      next: (updated) => {
        post.votes = updated.votes;
        post.canVote = updated.canVote;
        post.userVote = updated.userVote;
        if (updated.estado) post.estado = updated.estado;
        this.toast('Voto registrado');
        this.cdr.detectChanges();
      },
      error: () => {
        // Revierte optimistic
        if (choice === 'accept') post.votes.yes--;
        else post.votes.no--;
        post.votes.total = post.votes.yes + post.votes.no;
        post.canVote = true;
        this.toast('Error al votar');
      },
    });
  }

  onCommentsToggled(post: Queja): void {
    post.showComments = !post.showComments;

    if (post.showComments && post.comments.length === 0) {
      // Siempre recarga — el paginado no trae comments
      this.quejaService
        .obtenerQuejaPorId(post.id, this.user?.id || '')
        .subscribe({
          next: (u) => {
            const found = this.posts.find((p) => p.id === post.id);
            if (found) {
              found.comments = u.comments || [];
              found.commentsCount = u.commentsCount || found.comments.length;
            }
            this.cdr.detectChanges();
          },
          error: () => this.toast('Error al cargar comentarios'),
        });
    }
  }

  onCommentAdded(e: { post: Queja; text: string }): void {
    if (!e.text?.trim() || !this.user?.id) return;

    this.comentarioService
      .agregarComentario(e.post.id, this.user.id, e.text.trim())
      .subscribe({
        next: (c) => {
          // Busca el post en el array original (no la referencia del evento)
          const post = this.posts.find((p) => p.id === e.post.id);
          if (post) {
            post.comments = [...post.comments, c];
            post.commentsCount = post.comments.length;
          }
          this.toast('Comentario agregado');
          this.cdr.detectChanges();
        },
        error: () => this.toast('Error al comentar'),
      });
  }

  onCommentTextChange(postId: string, text: string): void {
    this.commentTexts[postId] = text;
  }

  onCommentMenuToggle(e: { commentId: string }): void {
    this.showCommentMenuModal[e.commentId] =
      !this.showCommentMenuModal[e.commentId];
  }

  onStartEditComment(comment: any): void {
    this.editingCommentId = comment.id;
    this.editingCommentText = comment.texto;
  }

  onSaveEditComment(e: { post: Queja }): void {
    if (!this.editingCommentId || !this.user?.id) return;
    this.comentarioService
      .actualizarComentario(
        this.editingCommentId,
        this.user.id,
        this.editingCommentText.trim(),
      )
      .subscribe({
        next: () => {
          const c = e.post.comments.find((x) => x.id === this.editingCommentId);
          if (c) c.texto = this.editingCommentText.trim();
          this.editingCommentId = null;
          this.toast('Comentario actualizado');
        },
      });
  }

  onDeleteComment(e: { post: Queja; commentId: string }): void {
    if (!this.user?.id || !confirm('¿Eliminar este comentario?')) return;
    this.comentarioService
      .eliminarComentario(e.commentId, this.user.id)
      .subscribe({
        next: () => {
          e.post.comments = e.post.comments.filter((c) => c.id !== e.commentId);
          e.post.commentsCount = e.post.comments.length;
          this.toast('Comentario eliminado');
        },
      });
  }

  // ── Posts CRUD ────────────────────────────────────────────────
  onEditPost(post: Queja): void {
    this.editingQueja = { ...post };
    this.showEditModal = true;
  }
  onDeletePost(post: Queja): void {
    if (!confirm('¿Eliminar este reporte?') || !this.user?.id) return;
    this.quejaService.eliminarQueja(post.id, this.user.id).subscribe({
      next: () => {
        this.posts = this.posts.filter((p) => p.id !== post.id);
        this.toast('Reporte eliminado');
      },
    });
  }

  onBookmark(post: Queja): void {
    (post as any).meta = (post as any).meta || {};
    (post as any).meta.saved = !(post as any).meta.saved;
    this.toast(
      (post as any).meta.saved ? 'Guardado' : 'Eliminado de guardados',
    );
  }

  onShare(post: Queja): void {
    const url = `${location.origin}/quejas/${post.id}`;
    navigator.clipboard.writeText(url).then(() => this.toast('Enlace copiado'));
  }

  onProfileClicked(usuario: Usuario): void {
    if (!usuario?.id) return;
    usuario.id === this.user?.id
      ? this.router.navigate(['/public/profile'])
      : this.router.navigate(['/public/user-profile', usuario.id]);
  }

  // ── Historial ─────────────────────────────────────────────────
  onOpenHistorial(queja: Queja): void {
    this.selectedQuejaHistorial = queja;
    this.showHistorialModal = true;
    this.loadingHistorial = true;
    this.historialService.obtenerHistorialPorQueja(queja.id).subscribe({
      next: (e) => {
        this.historialEventos = this.historialService.ordenarPorFecha(e, false);
        this.loadingHistorial = false;
      },
      error: () => {
        this.loadingHistorial = false;
      },
    });
  }

  closeHistorial(): void {
    this.showHistorialModal = false;
    this.selectedQuejaHistorial = null;
    this.historialEventos = [];
  }

  // ── Modal comentarios ─────────────────────────────────────────
  openCommentsModal(post: Queja): void {
    this.selectedReporteForComments = JSON.parse(JSON.stringify(post));
    this.showCommentsModal = true;
  }

  closeCommentsModal(): void {
    this.showCommentsModal = false;
    this.selectedReporteForComments = null;
    this.newCommentText = '';
  }

  // ── Crear reporte ─────────────────────────────────────────────
  onReportCreated(): void {
    this.showCreateModal = false;
    this.loadPosts(true);
    this.toast('¡Reporte publicado!');
  }

  // ── Utils ─────────────────────────────────────────────────────
  trackByPostId(_: number, post: Queja): string {
    return post.id;
  }
  toast(msg: string): void {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
