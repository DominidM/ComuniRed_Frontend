import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
  OnDestroy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Reel {
  id: number;
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
  imports: [CommonModule],
  templateUrl: './reels.component.html',
  styleUrls: ['./reels.component.css'],
})
export class ReelsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer', { static: false })
  videoPlayer!: ElementRef<HTMLVideoElement>;

  /** Recibe el modo oscuro del padre: <app-reels [isDarkMode]="isDarkMode"> */
  @Input() isDarkMode = true;

  currentIndex = 0;
  isPlaying = false;
  isMuted = false;
  isLoading = true;
  hasError = false;
  showComments = false;

  /** Progreso del video 0-100 para la barra */
  videoProgress = 0;
  private isSeeking = false;

  /** Throttle del scroll para evitar saltos múltiples */
  private scrollThrottle = false;

  reels: Reel[] = [
    { id: 1, videoUrl: 'assets/videos/reel1.mp4', title: 'ByPass las torres', author: 'Municipalidad de Lima', likes: 1234, comments: 89, shares: 45, description: 'Obras en construcción para mejorar el tráfico', avatarUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1762745360/35e70a0b-c03f-4625-a392-a128d2fc0c7c.png', liked: false, saved: false },
    { id: 2, videoUrl: 'assets/videos/reel2.mp4', title: 'Trabajando para ustedes', author: 'Municipalidad de SJL', likes: 856, comments: 34, shares: 21, description: 'Falta de iluminación #AlumbradoPúblico', avatarUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1762745354/6d60a8ca-45a9-4529-83aa-dfe7e0f19403.png', liked: false, saved: false },
    { id: 3, videoUrl: 'assets/videos/reel3.mp4', title: 'bailecito', author: 'Jose Jeri', likes: 46, comments: 34, shares: 21, description: 'Baile popular', avatarUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1762745297/imagen_2025-11-09_222811177_easpfs.png', liked: false, saved: false },
    { id: 4, videoUrl: 'assets/videos/reel4.mp4', title: 'Trabajando para ustedes', author: 'Municipalidad de SJL', likes: 86, comments: 34, shares: 21, description: 'Falta de iluminación #AlumbradoPúblico', avatarUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1762745354/6d60a8ca-45a9-4529-83aa-dfe7e0f19403.png', liked: false, saved: false },
    { id: 5, videoUrl: 'assets/videos/reel5.mp4', title: 'Trabajando para ustedes', author: 'Municipalidad de Lima', likes: 836, comments: 34, shares: 21, description: 'Falta de iluminación #AlumbradoPúblico', avatarUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1762745360/35e70a0b-c03f-4625-a392-a128d2fc0c7c.png', liked: false, saved: false },
    { id: 6, videoUrl: 'assets/videos/reel6.mp4', title: 'Trabajando para ustedes', author: 'Municipalidad de Lima', likes: 53, comments: 34, shares: 21, description: 'Falta de iluminación #AlumbradoPúblico', avatarUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1762745360/35e70a0b-c03f-4625-a392-a128d2fc0c7c.png', liked: false, saved: false },
    { id: 7, videoUrl: 'assets/videos/reel7.mp4', title: 'Via rapida Wiesse', author: 'Municipalidad de SJL', likes: 1, comments: 34, shares: 21, description: 'Falta de iluminación #AlumbradoPúblico', avatarUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1762745354/6d60a8ca-45a9-4529-83aa-dfe7e0f19403.png', liked: false, saved: false },
    { id: 8, videoUrl: 'assets/videos/reel8.mp4', title: 'Parque las Flores', author: 'Municipalidad de SJL', likes: 32, comments: 12, shares: 8, description: 'Manteniendo nuestros espacios verdes limpios y seguros', avatarUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1762745354/6d60a8ca-45a9-4529-83aa-dfe7e0f19403.png', liked: false, saved: false },
  ];

  ngAfterViewInit() {
    try {
      const m = localStorage.getItem('reelsMuted');
      if (m !== null) this.isMuted = m === 'true';
    } catch {}
    setTimeout(() => this.loadVideo(), 50);
  }

  ngOnDestroy() {
    const video = this.videoPlayer?.nativeElement;
    if (video) { video.pause(); video.src = ''; video.load(); }
    this.removeSeekListeners();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
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

  nextReel() {
    if (this.currentIndex < this.reels.length - 1) { this.currentIndex++; this.resetVideo(); }
  }

  previousReel() {
    if (this.currentIndex > 0) { this.currentIndex--; this.resetVideo(); }
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
    r.liked ? (r.likes--, r.liked = false) : (r.likes++, r.liked = true);
  }

  saveReel() { this.reels[this.currentIndex].saved = !this.reels[this.currentIndex].saved; }

  shareReel() {
    if (navigator.share) {
      navigator.share({ title: this.currentReel.title, text: this.currentReel.description }).catch(() => {});
    } else {
      try { navigator.clipboard.writeText(`${this.currentReel.title} — ${this.currentReel.description}`); } catch {}
    }
  }

  toggleComments() { this.showComments = !this.showComments; }

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