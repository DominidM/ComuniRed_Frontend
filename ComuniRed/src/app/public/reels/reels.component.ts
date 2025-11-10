import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
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
  avatarUrl?: string; // <- nuevo
}

@Component({
  selector: 'app-reels',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reels.component.html',
  styleUrls: ['./reels.component.css']
})
export class ReelsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef<HTMLVideoElement>;

  currentIndex = 0;
  isPlaying = false;
  isMuted = false; // preference
  isLoading = true;
  hasError = false;
  private userInteracted = false;

  reels: Reel[] = [
    { id: 1, videoUrl: 'assets/videos/reel1.mp4', title: 'ByPass las torres', author: 'Municipalidad de Lima', likes: 1234, comments: 89, shares: 45, description: 'Obras en construcción para mejorar el tráfico', avatarUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1762745360/35e70a0b-c03f-4625-a392-a128d2fc0c7c.png' },
    { id: 2, videoUrl: 'assets/videos/reel2.mp4', title: 'Trabajando para ustedes', author: 'Municipalidad de SJL', likes: 856, comments: 34, shares: 21, description: 'Falta de iluminación #AlumbradoPúblico', avatarUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1762745354/6d60a8ca-45a9-4529-83aa-dfe7e0f19403.png' },
    { id: 3, videoUrl: 'assets/videos/reel3.mp4', title: 'bailecito', author: 'Jose Jeri', likes: 46, comments: 34, shares: 21, description: 'Baile popular', avatarUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1762745297/imagen_2025-11-09_222811177_easpfs.png' },
    { id: 4, videoUrl: 'assets/videos/reel4.mp4', title: 'Trabajando para ustedes', author: 'Municipalidad de SJL', likes: 86, comments: 34, shares: 21, description: 'Falta de iluminación #AlumbradoPúblico', avatarUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1762745354/6d60a8ca-45a9-4529-83aa-dfe7e0f19403.png' },
    { id: 5, videoUrl: 'assets/videos/reel5.mp4', title: 'Trabajando para ustedes', author: 'Municipalidad de Lima', likes: 836, comments: 34, shares: 21, description: 'Falta de iluminación #AlumbradoPúblico', avatarUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1762745360/35e70a0b-c03f-4625-a392-a128d2fc0c7c.png' },
    { id: 6, videoUrl: 'assets/videos/reel6.mp4', title: 'Trabajando para ustedes', author: 'Municipalidad de Lima', likes: 53, comments: 34, shares: 21, description: 'Falta de iluminación #AlumbradoPúblico', avatarUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1762745360/35e70a0b-c03f-4625-a392-a128d2fc0c7c.png' },
    { id: 7, videoUrl: 'assets/videos/reel7.mp4', title: 'Via rapida Wiesse', author: 'Municipalidad de SJL', likes: 1, comments: 34, shares: 21, description: 'Falta de iluminación #AlumbradoPúblico', avatarUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1762745354/6d60a8ca-45a9-4529-83aa-dfe7e0f19403.png' },
    { id: 8, videoUrl: 'assets/videos/reel8.mp4', title: 'Parque las Flores', author: 'Municipalidad de SJL', likes: 32, comments: 12, shares: 8, description: 'Manteniendo nuestros espacios verdes limpios y seguros', avatarUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1762745354/6d60a8ca-45a9-4529-83aa-dfe7e0f19403.png' }
  ];

  private onWindowResizeBound = () => {
    this.applySizingRules();
  }

  ngAfterViewInit() {
    // restore saved mute preference (si existe)
    try {
      const saved = localStorage.getItem('reelsMuted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
        this.userInteracted = true;
      }
    } catch (e) { /* ignore localStorage errors */ }

    setTimeout(() => this.initVideo(), 50);
    window.addEventListener('resize', this.onWindowResizeBound);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onWindowResizeBound);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') { event.preventDefault(); this.nextReel(); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); this.previousReel(); }
    else if (event.key === ' ') { event.preventDefault(); this.togglePlayPause(); }
  }

  get currentReel(): Reel { return this.reels[this.currentIndex]; }

  private initVideo() {
    if (!this.videoPlayer) return;
    this.hasError = false;
    this.isLoading = true;
    this.setVideoSource(this.currentReel.videoUrl);
    // reproducción controlada por tryPlayRespectingPreference()
  }

  private setVideoSource(url: string) {
    const video: HTMLVideoElement = this.videoPlayer.nativeElement;
    video.style.width = '';
    video.style.height = '';
    video.style.maxWidth = '';
    video.style.maxHeight = '';
    video.style.objectFit = 'cover';
    video.removeAttribute('src');

    const source = video.querySelector('source');
    if (source) source.setAttribute('src', url);
    else video.setAttribute('src', url);
    video.load();

    const onLoadedMeta = () => {
      this.isLoading = false;
      this.hasError = false;
      this.applySizingRules();
      this.tryPlayRespectingPreference();
    };

    const onError = (ev: Event) => {
      console.error('Video load error', ev);
      this.hasError = true;
      this.isLoading = false;
    };

    video.removeEventListener('loadedmetadata', onLoadedMeta);
    video.removeEventListener('error', onError);
    video.addEventListener('loadedmetadata', onLoadedMeta, { once: true });
    video.addEventListener('error', onError, { once: true });
  }

  private tryPlayRespectingPreference() {
    const video = this.videoPlayer.nativeElement;

    if (this.userInteracted) {
      video.muted = this.isMuted;
      video.play().then(() => { this.isPlaying = true; })
        .catch((err) => { console.warn('Play failed after user interaction', err); this.isPlaying = false; });
      return;
    }

    video.muted = this.isMuted;
    video.play().then(() => { this.isPlaying = true; }).catch(() => {
      // autoplay with sound blocked -> fallback to muted autoplay
      video.muted = true;
      this.isMuted = true;
      video.play().then(() => { this.isPlaying = true; }).catch((err) => {
        console.warn('Muted play also failed', err);
        this.isPlaying = false;
      });
    });
  }

  // custom UI actions
  togglePlayPause() {
    const video = this.videoPlayer.nativeElement;
    if (!video) return;
    this.userInteracted = true;
    if (this.isPlaying) { video.pause(); this.isPlaying = false; }
    else {
      video.muted = this.isMuted;
      video.play().then(() => { this.isPlaying = true; }).catch((err) => {
        console.warn('Play blocked', err);
        video.muted = true;
        this.isMuted = true;
        video.play().then(() => { this.isPlaying = true; }).catch(() => { this.isPlaying = false; });
      });
    }
  }

  toggleMute() {
    const video = this.videoPlayer.nativeElement;
    if (!video) return;
    this.userInteracted = true;
    this.isMuted = !this.isMuted;
    video.muted = this.isMuted;
    try { localStorage.setItem('reelsMuted', String(this.isMuted)); } catch {}
  }

  // fullscreen toggle
  toggleFullscreen() {
    const container = this.videoPlayer.nativeElement.parentElement as HTMLElement;
    if (!container) return;
    const doc: any = document;
    if (doc.fullscreenElement) {
      doc.exitFullscreen?.();
    } else {
      container.requestFullscreen?.();
    }
  }

  resetVideo() {
    const video = this.videoPlayer.nativeElement;
    this.isLoading = true;
    this.hasError = false;
    try {
      video.pause();
      video.currentTime = 0;
      this.setVideoSource(this.currentReel.videoUrl);
    } catch (err) {
      console.error('resetVideo error', err);
      this.hasError = true;
      this.isLoading = false;
    }
  }

  nextReel() {
    if (this.currentIndex < this.reels.length - 1) {
      this.currentIndex++;
      this.resetVideo();
    }
  }

  previousReel() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.resetVideo();
    }
  }

  onVideoEnd() {
    if (this.currentIndex < this.reels.length - 1) this.nextReel();
    else { this.currentIndex = 0; this.resetVideo(); }
  }

  private applySizingRules() {
    const video: HTMLVideoElement = this.videoPlayer.nativeElement;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const container = (video.parentElement as HTMLElement) || video;
    const rect = container.getBoundingClientRect();
    const containerW = rect.width;
    const containerH = rect.height;

    const intrinsicW = video.videoWidth;
    const intrinsicH = video.videoHeight;

    // Si el vídeo es más pequeño que el contenedor -> mostrarlo a tamaño nativo (no upscaling)
    if (intrinsicW <= containerW && intrinsicH <= containerH) {
      video.style.width = intrinsicW + 'px';
      video.style.height = 'auto';
      video.style.objectFit = 'none';
      video.style.maxWidth = '100%';
      video.style.maxHeight = '100%';
    } else {
      // suficiente resolución: llenar contenedor (crop en mobile) o contener en desktop
      // decisión: por CSS usamos object-fit: contain en desktop y cover en móvil
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = window.innerWidth >= 1200 ? 'contain' : 'cover';
      video.style.maxWidth = 'none';
      video.style.maxHeight = 'none';
    }
  }

  onCanPlay() { this.isLoading = false; }
  onVideoLoaded() { this.isLoading = false; this.hasError = false; }
  onVideoError(event: Event) {
    this.isLoading = false;
    this.hasError = true;
    console.error('Video error:', event);
  }

  retryVideo() { this.hasError = false; this.isLoading = true; this.resetVideo(); }

  formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  likeReel() { this.reels[this.currentIndex].likes++; }

  // avatar fallback handler
  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement;
    const fallback = 'assets/images/default-avatar.png';
    if (!img) return;
    if (img.dataset['fallbackApplied'] === '1') return;
    img.dataset['fallbackApplied'] = '1';
    img.src = fallback;
  }
}