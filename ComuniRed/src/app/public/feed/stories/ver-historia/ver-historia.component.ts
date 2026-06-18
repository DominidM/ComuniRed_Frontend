import {
  Component, OnInit, OnDestroy, Input, Output, EventEmitter,
  ViewChild, ElementRef, ChangeDetectorRef, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoriaService, Story } from '../../../../services/historia.service';

export interface UserStoryGroup {
  userId: string;
  userName: string;
  userAvatar: string;
  stories: Story[];
  allSeen: boolean;
  latestTime: string;
}

@Component({
  selector: 'app-ver-historia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ver-historia.component.html',
  styleUrls: ['./ver-historia.component.css'],
})
export class VerHistoriaComponent implements OnInit, OnDestroy {
  @Input() group: UserStoryGroup | null = null;
  @Input() currentUserId: string | null = null;
  @Input() pageMode = false;
  @Output() close = new EventEmitter<void>();
  @Output() storyDeleted = new EventEmitter<string>();

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  indiceActual = 0;
  progreso = 0;
  isPlaying = true;
  textoRespuesta = '';
  mostrarConfirmacionEliminar = false;

  // Music
  musicaSonando = false;
  private audioMusica: HTMLAudioElement | null = null;

  // Volume
  volumen = 0.5;
  muted = false;

  // Heart / like
  leGusta = false;

  private intervaloProgreso: any;
  private timeoutHold: any;
  private sosteniendo = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private historiaService: HistoriaService,
  ) {}

  ngOnInit(): void {
    this.iniciarProgreso();
    this.marcarVistasPendientes();
    this.iniciarMusicaAuto();
  }

  ngOnDestroy(): void {
    this.limpiarIntervalo();
    this.limpiarMusica();
    clearTimeout(this.timeoutHold);
  }

  get historiaActual(): Story | null {
    return this.group?.stories[this.indiceActual] ?? null;
  }

  get esImagen(): boolean {
    return !!this.historiaActual?.imageUrl && !this.historiaActual?.videoUrl;
  }

  get esVideo(): boolean {
    return !!this.historiaActual?.videoUrl;
  }

  get esPropia(): boolean {
    return this.group?.userId === this.currentUserId;
  }

  get placeholderRespuesta(): string {
    return `Responder a ${this.group?.userName || 'usuario'}...`;
  }

  /* ─── NAVEGACIÓN ─── */
  siguiente(event?: Event): void {
    event?.stopPropagation();
    if (!this.group) return;
    if (this.indiceActual < this.group.stories.length - 1) {
      this.indiceActual++;
      this.progreso = 0;
      this.isPlaying = true;
      this.limpiarMusica();
      this.iniciarProgreso();
      this.iniciarMusicaAuto();
    } else {
      this.cerrar();
    }
  }

  anterior(event?: Event): void {
    event?.stopPropagation();
    if (this.indiceActual > 0) {
      this.indiceActual--;
      this.progreso = 0;
      this.isPlaying = true;
      this.limpiarMusica();
      this.iniciarProgreso();
      this.iniciarMusicaAuto();
    }
  }

  onTap(event: MouseEvent): void {
    if (this.sosteniendo) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    if (x < rect.width * 0.35) this.anterior();
    else if (x > rect.width * 0.65) this.siguiente();
  }

  /* ─── HOLD TO PAUSE ─── */
  onHoldStart(): void {
    this.sosteniendo = true;
    this.timeoutHold = setTimeout(() => {
      if (this.isPlaying) {
        this.isPlaying = false;
        this.limpiarIntervalo();
        this.pausarVideo();
        this.pausarMusica();
      }
    }, 200);
  }

  onHoldEnd(): void {
    clearTimeout(this.timeoutHold);
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.iniciarProgreso();
      this.reanudarVideo();
      this.reanudarMusica();
    }
    this.sosteniendo = false;
  }

  @HostListener('mouseup')
  @HostListener('touchend')
  onGlobalHoldEnd(): void {
    if (this.sosteniendo || !this.isPlaying) {
      clearTimeout(this.timeoutHold);
      if (!this.isPlaying) {
        this.isPlaying = true;
        this.iniciarProgreso();
        this.reanudarVideo();
        this.reanudarMusica();
      }
      this.sosteniendo = false;
    }
  }

  private pausarVideo(): void {
    const vid = this.videoPlayer?.nativeElement;
    if (vid && !vid.paused) vid.pause();
  }

  private reanudarVideo(): void {
    const vid = this.videoPlayer?.nativeElement;
    if (vid && vid.paused) vid.play().catch(() => {});
  }

  /* ─── MUSIC SYNC ─── */
  private pausarMusica(): void {
    if (this.audioMusica && this.musicaSonando) {
      this.audioMusica.pause();
      this.musicaSonando = false;
      this.cdr.detectChanges();
    }
  }

  private reanudarMusica(): void {
    if (this.audioMusica && !this.musicaSonando) {
      this.audioMusica.play().then(() => {
        this.musicaSonando = true;
        this.cdr.detectChanges();
      }).catch(() => {});
    }
  }

  /* ─── PLAY / PAUSE (header button) ─── */
  togglePlayPause(): void {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.iniciarProgreso();
      this.reanudarVideo();
      this.reanudarMusica();
    } else {
      this.limpiarIntervalo();
      this.pausarVideo();
      this.pausarMusica();
    }
  }

  /* ─── AUTO-INI MÚSICA ─── */
  private iniciarMusicaAuto(): void {
    if (!this.historiaActual?.songPreviewUrl || this.audioMusica) return;
    this.audioMusica = new Audio(this.historiaActual.songPreviewUrl);
    this.audioMusica.volume = this.muted ? 0 : this.volumen;
    this.audioMusica.addEventListener('ended', () => {
      this.musicaSonando = false;
      this.cdr.detectChanges();
    });
    this.audioMusica.play().then(() => {
      this.musicaSonando = true;
      this.cdr.detectChanges();
    }).catch(() => {
      this.musicaSonando = false;
      this.cdr.detectChanges();
    });
  }

  /* ─── PROGRESO ─── */
  private iniciarProgreso(): void {
    this.limpiarIntervalo();
    if (!this.isPlaying) return;
    const duracion = (this.historiaActual?.duration || 5) * 1000;
    const pasos = 100;
    const intervalo = duracion / pasos;
    this.intervaloProgreso = setInterval(() => {
      this.progreso += 100 / pasos;
      if (this.progreso >= 100) {
        this.progreso = 100;
        this.limpiarIntervalo();
        setTimeout(() => this.siguiente(), 200);
      }
      this.cdr.detectChanges();
    }, intervalo);
  }

  private limpiarIntervalo(): void {
    if (this.intervaloProgreso) {
      clearInterval(this.intervaloProgreso);
      this.intervaloProgreso = null;
    }
  }

  onVideoTerminado(): void {
    this.limpiarIntervalo();
    setTimeout(() => this.siguiente(), 200);
  }

  onVideoCargado(): void {
    const vid = this.videoPlayer?.nativeElement;
    if (vid && this.isPlaying) {
      vid.play().catch(() => {});
    }
  }

  /* ─── VISTAS ─── */
  private marcarVistasPendientes(): void {
    if (!this.group || !this.currentUserId) return;
    const noVistas = this.group.stories.filter((s) => !s.seen);
    for (const story of noVistas) {
      story.seen = true;
      this.historiaService.marcarVista(story.id, this.currentUserId).subscribe({ error: () => {} });
    }
    this.group.allSeen = this.group.stories.every((s) => s.seen);
  }

  /* ─── VOLUMEN ─── */
  onVolumeChange(): void {
    if (this.audioMusica) {
      this.audioMusica.volume = this.muted ? 0 : this.volumen;
    }
  }

  toggleMute(): void {
    this.muted = !this.muted;
    if (this.audioMusica) {
      this.audioMusica.volume = this.muted ? 0 : this.volumen;
    }
  }

  /* ─── MÚSICA (widget inferior) ─── */
  toggleMusica(): void {
    if (!this.historiaActual?.songPreviewUrl) return;
    if (this.musicaSonando && this.audioMusica) {
      this.audioMusica.pause();
      this.audioMusica = null;
      this.musicaSonando = false;
      return;
    }
    if (this.audioMusica && !this.musicaSonando) {
      this.audioMusica.play().then(() => {
        this.musicaSonando = true;
        this.cdr.detectChanges();
      }).catch(() => {});
      return;
    }
    this.audioMusica = new Audio(this.historiaActual.songPreviewUrl);
    this.audioMusica.volume = this.muted ? 0 : this.volumen;
    this.audioMusica.addEventListener('ended', () => { this.musicaSonando = false; this.cdr.detectChanges(); });
    this.audioMusica.play().then(() => { this.musicaSonando = true; this.cdr.detectChanges(); }).catch(() => { this.musicaSonando = false; this.cdr.detectChanges(); });
  }

  private limpiarMusica(): void {
    if (this.audioMusica) { this.audioMusica.pause(); this.audioMusica = null; }
    this.musicaSonando = false;
  }

  /* ─── ELIMINAR ─── */
  confirmarEliminar(): void {
    this.mostrarConfirmacionEliminar = true;
  }

  cancelarEliminar(): void {
    this.mostrarConfirmacionEliminar = false;
  }

  eliminarHistoriaActual(): void {
    if (!this.historiaActual || !this.group) return;
    const id = this.historiaActual.id;
    this.historiaService.eliminar(id).subscribe({
      next: () => {
        this.group!.stories = this.group!.stories.filter((s) => s.id !== id);
        if (this.group!.stories.length === 0) {
          this.storyDeleted.emit(this.group!.userId);
          this.cerrar();
        } else {
          if (this.indiceActual >= this.group!.stories.length) {
            this.indiceActual = this.group!.stories.length - 1;
          }
          this.progreso = 0;
          this.isPlaying = true;
          this.mostrarConfirmacionEliminar = false;
          this.limpiarMusica();
          this.iniciarProgreso();
          this.iniciarMusicaAuto();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.mostrarConfirmacionEliminar = false;
        this.cdr.detectChanges();
      },
    });
  }

  /* ─── RESPUESTA ─── */
  enviarRespuesta(): void {
    if (!this.textoRespuesta.trim()) return;
    this.textoRespuesta = '';
  }

  /* ─── LIKE / SHARE ─── */
  toggleLike(): void {
    this.leGusta = !this.leGusta;
  }

  compartir(): void {
    if (navigator.share && this.historiaActual) {
      navigator.share({
        title: 'Historia en ComuniRed',
        text: this.historiaActual.text || 'Mira esta historia',
        url: window.location.href,
      }).catch(() => {});
    }
  }

  /* ─── CIERRE ─── */
  cerrar(): void {
    this.limpiarIntervalo();
    this.limpiarMusica();
    this.close.emit();
  }

  /* ─── UTILIDADES ─── */
  formatTime(fecha: string): string {
    if (!fecha) return '';
    const diff = (Date.now() - new Date(fecha).getTime()) / 1000;
    if (diff < 60) return 'ahora';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return new Date(fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  }

  trackPorId(_index: number, story: Story): string {
    return story.id;
  }
}
