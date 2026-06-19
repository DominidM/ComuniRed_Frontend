import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReelService, ReelResponse, ReelComentario } from '../../services/reel.service';
import { UsuarioService } from '../../services/usuario.service';

export interface Reel {
  id: string;
  videoUrl: string;
  title: string;
  author: string;
  likes: number;
  comments: number;
  shares: number;
  description: string;
  avatarUrl?: string;
  liked?: boolean;
  saved?: boolean;
}

@Component({
  selector: 'app-reels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reels.component.html',
  styleUrls: ['./reels.component.css'],
})
export class ReelsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer', { static: false })
  videoPlayer!: ElementRef<HTMLVideoElement>;

  currentIndex = 0;
  isPlaying = false;
  isMuted = false;
  isLoading = true;
  hasError = false;
  showComments = false;
  commentText = '';
  comentarios: ReelComentario[] = [];
  loadingComments = false;
  sendingComment = false;
  private comentariosCache = new Map<string, ReelComentario[]>();

  videoProgress = 0;
  isDarkMode = true;
  private isSeeking = false;
  private scrollThrottle = false;

  reels: Reel[] = [];

  private usuarioId = '';
  private usuarioNombre = '';
  private usuarioAvatar = '';

  constructor(
    private reelService: ReelService,
    private usuarioService: UsuarioService,
    private router: Router,
  ) {}

  ngAfterViewInit() {
    try {
      const m = localStorage.getItem('reelsMuted');
      if (m !== null) this.isMuted = m === 'true';
    } catch {}
    this.cargarReels();
  }

  private cargarReels(): void {
    const user = this.usuarioService.getUser() as any;
    if (user) {
      this.usuarioId = user.id || user._id || '';
      this.usuarioNombre = (user.nombre || '') + ' ' + (user.apellido || '');
      this.usuarioAvatar = this.usuarioService.obtenerFotoMiniatura(user.foto_perfil, 36) || '';
    }
    this.reelService.obtenerActivos(this.usuarioId).subscribe({
      next: (res) => {
        this.reels = res.map((r: ReelResponse) => ({
          id: r.id,
          videoUrl: r.videoUrl,
          title: r.title,
          author: r.author,
          likes: r.likes,
          comments: r.comentariosCount,
          shares: r.shares,
          description: r.description,
          avatarUrl: r.avatarUrl,
          liked: r.liked,
          saved: r.saved,
        }));
        setTimeout(() => {
          this.loadVideo();
          this.cargarComentarios();
          if (this.reels.length > 1) this.precargarComentarios(this.reels[1].id);
        }, 50);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy() {
    const video = this.videoPlayer?.nativeElement;
    if (video) { video.pause(); video.src = ''; video.load(); }
    this.removeSeekListeners();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const tag = (event.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (event.target as HTMLElement)?.isContentEditable) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); this.nextReel(); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); this.previousReel(); }
    else if (event.key === ' ') { event.preventDefault(); this.togglePlayPause(); }
    else if (event.key === 'Escape' && this.showComments) this.showComments = false;
  }

  /** Scroll del mouse → cambia de video (con throttle 600ms) */
  onWheel(event: WheelEvent) {
    event.preventDefault();
    if (this.scrollThrottle) return;
    this.scrollThrottle = true;
    setTimeout(() => { this.scrollThrottle = false; }, 600);

    if (event.deltaY > 0) {
      this.nextReel();
    } else if (event.deltaY < 0) {
      this.previousReel();
    }
  }

  get currentReel(): Reel { return this.reels[this.currentIndex]; }
  get isFirstReel(): boolean { return this.currentIndex === 0; }
  get isLastReel(): boolean { return this.currentIndex === this.reels.length - 1; }

  // ── Video ────────────────────────────────────────────
  private loadVideo() {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    this.hasError = false;
    this.isLoading = true;
    this.videoProgress = 0;
    video.removeAttribute('style');
    const source = video.querySelector('source');
    if (source) source.setAttribute('src', this.currentReel.videoUrl);
    else video.src = this.currentReel.videoUrl;
    video.load();
    video.addEventListener('loadedmetadata', () => { this.isLoading = false; this.tryPlay(); }, { once: true });
    video.addEventListener('error', () => { this.hasError = true; this.isLoading = false; }, { once: true });
  }

  private tryPlay() {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    video.muted = this.isMuted;
    video.play()
      .then(() => { this.isPlaying = true; })
      .catch(() => {
        video.muted = true; this.isMuted = true;
        video.play().then(() => { this.isPlaying = true; }).catch(() => { this.isPlaying = false; });
      });
  }

  togglePlayPause() {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    if (this.isPlaying) { video.pause(); this.isPlaying = false; }
    else {
      video.muted = this.isMuted;
      video.play()
        .then(() => { this.isPlaying = true; })
        .catch(() => {
          video.muted = true; this.isMuted = true;
          video.play().then(() => { this.isPlaying = true; }).catch(() => {});
        });
    }
  }

  toggleMute() {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    this.isMuted = !this.isMuted;
    video.muted = this.isMuted;
    try { localStorage.setItem('reelsMuted', String(this.isMuted)); } catch {}
  }

  resetVideo() {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    video.pause(); video.currentTime = 0;
    this.videoProgress = 0;
    this.loadVideo();
  }

  private recargarComentarios() {
    this.cargarComentarios();
    const nextIdx = this.currentIndex + 1;
    if (nextIdx < this.reels.length) {
      this.precargarComentarios(this.reels[nextIdx].id);
    }
    if (this.currentIndex > 0) {
      this.precargarComentarios(this.reels[this.currentIndex - 1].id);
    }
  }

  nextReel() {
    if (this.currentIndex < this.reels.length - 1) {
      this.currentIndex++;
      this.resetVideo();
      this.recargarComentarios();
      this.reelService.incrementarVista(this.reels[this.currentIndex].id).subscribe();
    }
  }

  previousReel() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.resetVideo();
      this.recargarComentarios();
    }
  }

  onVideoEnd() {
    if (this.currentIndex < this.reels.length - 1) this.nextReel();
    else { this.currentIndex = 0; this.resetVideo(); }
  }

  onCanPlay() { this.isLoading = false; }
  onVideoLoaded() { this.isLoading = false; this.hasError = false; }
  onVideoError(event: Event) { this.isLoading = false; this.hasError = true; }

  // ── Progreso del video ───────────────────────────────
  onTimeUpdate() {
    if (this.isSeeking) return;
    const video = this.videoPlayer?.nativeElement;
    if (!video || !video.duration) return;
    this.videoProgress = (video.currentTime / video.duration) * 100;
  }

  /** Click directo en la barra para saltar */
  seekVideo(event: MouseEvent) {
    const video = this.videoPlayer?.nativeElement;
    if (!video || !video.duration) return;
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    video.currentTime = pct * video.duration;
    this.videoProgress = pct * 100;
    event.stopPropagation();
  }

  /** Drag en la barra */
  startSeeking(event: MouseEvent) {
    event.stopPropagation();
    this.isSeeking = true;
    const video = this.videoPlayer?.nativeElement;
    if (!video || !video.duration) return;

    const bar = (event.currentTarget as HTMLElement).querySelector('.progress-bar-bg') as HTMLElement
      || event.currentTarget as HTMLElement;

    const onMove = (e: MouseEvent) => {
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.videoProgress = pct * 100;
      video.currentTime = pct * video.duration;
    };
    const onUp = () => {
      this.isSeeking = false;
      this.removeSeekListeners();
    };

    this._seekMove = onMove;
    this._seekUp = onUp;
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  private _seekMove?: (e: MouseEvent) => void;
  private _seekUp?: () => void;

  private removeSeekListeners() {
    if (this._seekMove) window.removeEventListener('mousemove', this._seekMove);
    if (this._seekUp) window.removeEventListener('mouseup', this._seekUp);
  }

  // ── Acciones ─────────────────────────────────────────
  likeReel() {
    const r = this.reels[this.currentIndex];
    if (!this.usuarioId) return;
    this.reelService.marcarLike(r.id, this.usuarioId).subscribe({
      next: (res) => {
        r.likes = res.likes;
        r.liked = res.liked;
      },
    });
  }

  saveReel() {
    const r = this.reels[this.currentIndex];
    if (!this.usuarioId) return;
    this.reelService.marcarSave(r.id, this.usuarioId).subscribe({
      next: (res) => {
        r.saved = res.saved;
      },
    });
  }

  shareReel() {
    if (navigator.share) {
      navigator.share({ title: this.currentReel.title, text: this.currentReel.description }).catch(() => {});
    } else {
      try { navigator.clipboard.writeText(`${this.currentReel.title} — ${this.currentReel.description}`); } catch {}
    }
  }

  toggleComments() {
    this.showComments = !this.showComments;
    if (this.showComments) {
      this.cargarComentarios();
    }
  }

  cargarComentarios() {
    const reelId = this.reels[this.currentIndex]?.id;
    if (!reelId) return;

    if (this.comentariosCache.has(reelId)) {
      this.comentarios = this.comentariosCache.get(reelId)!;
      return;
    }

    this.comentarios = [];
    this.loadingComments = true;
    this.reelService.obtenerComentarios(reelId).subscribe({
      next: (res) => {
        this.comentarios = res.map(c => ({
          ...c,
          usuarioAvatar: this.usuarioService.obtenerFotoMiniatura(c.usuarioAvatar, 36),
        }));
        this.comentariosCache.set(reelId, this.comentarios);
        this.loadingComments = false;
      },
      error: () => { this.loadingComments = false; },
    });
  }

  private precargarComentarios(reelId: string) {
    if (!reelId || this.comentariosCache.has(reelId)) return;
    this.reelService.obtenerComentarios(reelId).subscribe({
      next: (res) => {
        this.comentariosCache.set(reelId, res.map(c => ({
          ...c,
          usuarioAvatar: this.usuarioService.obtenerFotoMiniatura(c.usuarioAvatar, 36),
        })));
      },
    });
  }

  enviarComentario() {
    const texto = this.commentText.trim();
    if (!texto || !this.usuarioId) return;
    const reelId = this.reels[this.currentIndex]?.id;
    if (!reelId) return;
    this.sendingComment = true;
    this.reelService.comentar(reelId, this.usuarioId, this.usuarioNombre, this.usuarioAvatar, texto).subscribe({
      next: (res) => {
        this.comentarios.push({
          ...res,
          usuarioAvatar: this.usuarioService.obtenerFotoMiniatura(res.usuarioAvatar, 36),
        });
        this.commentText = '';
        this.sendingComment = false;
        this.currentReel.comments = this.comentarios.length;
      },
      error: () => { this.sendingComment = false; },
    });
  }

  irAPerfil(usuarioId: string): void {
    this.router.navigate(['/public/profile', usuarioId]);
  }

  formatNumber(num: number): string {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
  }

  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img || img.dataset['fallbackApplied'] === '1') return;
    img.dataset['fallbackApplied'] = '1';
    img.src = 'assets/images/default-avatar.png';
  }
}