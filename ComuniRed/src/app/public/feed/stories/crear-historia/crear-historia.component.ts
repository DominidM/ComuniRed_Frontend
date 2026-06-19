import {
  Component, OnInit, OnDestroy, Input, Output, EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { HistoriaService } from '../../../../services/historia.service';
import { MusicaService, MusicTrackResponse as MusicTrack } from '../../../../services/musica.service';
import { Story } from '../../../../services/historia.service';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

@Component({
  selector: 'app-crear-historia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-historia.component.html',
  styleUrls: ['./crear-historia.component.css'],
})
export class CrearHistoriaComponent implements OnInit, OnDestroy {
  @Input() user: { id?: string; name: string; avatarUrl: string } | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() storyCreated = new EventEmitter<Story>();

  // Form state
  texto = '';
  archivo: File | null = null;
  previewUrl: string | null = null;
  esVideo = false;
  publicando = false;
  progresoSubida = 0;
  colorFondo = 'linear-gradient(135deg, #c0392b, #e74c3c)';
  duracion = 5;
  errorSubida = '';

  // Preview playback
  pausado = false;
  progresoPreview = 0;
  private intervaloPreview: any;

  // Volume
  volumen = 0.5;
  muted = false;

  readonly opcionesColor = [
    'linear-gradient(135deg, #000000, #000000)',
    'linear-gradient(135deg, #f39c12, #e67e22)',
    'linear-gradient(135deg, #2980b9, #3498db)',
    'linear-gradient(135deg, #27ae60, #2ecc71)',
    'linear-gradient(135deg, #8e44ad, #9b59b6)',
    'linear-gradient(135deg, #1a1a2e, #16213e)',
    'linear-gradient(135deg, #e91e63, #ff5722)',
    'linear-gradient(135deg, #00bcd4, #009688)',
  ];

  readonly opcionesDuracion = [
    { label: '5s', value: 5 },
    { label: '10s', value: 10 },
    { label: '15s', value: 15 },
  ];

  // Music
  mostrarBusquedaMusica = false;
  consultaMusica = '';
  resultadosMusica: MusicTrack[] = [];
  buscandoMusica = false;
  pistaSeleccionada: MusicTrack | null = null;
  musicaSonando = false;
  private audioMusica: HTMLAudioElement | null = null;
  private timeoutBusqueda: any;
  private suscripcionPublicar?: Subscription;

  // Preview in search results
  previewReproduciendo: MusicTrack | null = null;
  previewProgreso = 0;
  previewMuted = false;
  private previewAudio: HTMLAudioElement | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private historiaService: HistoriaService,
    private musicaService: MusicaService,
  ) {}

  ngOnInit(): void {
    this.resetear();
    this.iniciarPreview();
  }

  ngOnDestroy(): void {
    this.limpiarPreview();
    this.limpiarMusica();
    this.suscripcionPublicar?.unsubscribe();
  }

  get esValido(): boolean {
    return !!(this.texto.trim() || this.archivo);
  }

  cerrar(): void {
    if (this.publicando) return;
    this.limpiarPreview();
    this.limpiarMusica();
    this.suscripcionPublicar?.unsubscribe();
    this.close.emit();
  }

  resetear(): void {
    this.texto = '';
    this.archivo = null;
    this.previewUrl = null;
    this.esVideo = false;
    this.colorFondo = this.opcionesColor[0];
    this.duracion = 5;
    this.progresoSubida = 0;
    this.errorSubida = '';
    this.pausado = false;
    this.progresoPreview = 0;
    this.limpiarPreview();
    this.limpiarMusica();
    this.mostrarBusquedaMusica = false;
    this.consultaMusica = '';
    this.resultadosMusica = [];
    this.buscandoMusica = false;
    this.pistaSeleccionada = null;
  }

  /* ─── ARCHIVOS ─── */
  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.validarYPrevisualizar(input.files[0]);
      input.value = '';
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files[0];
    if (file) this.validarYPrevisualizar(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private validarYPrevisualizar(file: File): void {
    this.errorSubida = '';
    if (!ALLOWED_TYPES.includes(file.type)) {
      this.errorSubida = 'Formato no compatible. Usa JPG, PNG, WEBP, MP4 o MOV.';
      this.archivo = null; this.previewUrl = null; this.esVideo = false;
      this.cdr.detectChanges();
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      this.errorSubida = 'El archivo supera los 50 MB permitidos.';
      this.archivo = null; this.previewUrl = null; this.esVideo = false;
      this.cdr.detectChanges();
      return;
    }
    this.archivo = file;
    this.esVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  eliminarArchivo(event: Event): void {
    event.stopPropagation();
    this.archivo = null;
    this.previewUrl = null;
    this.esVideo = false;
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

  /* ─── PLAY / PAUSE (header) ─── */
  togglePlayPause(): void {
    this.pausado = !this.pausado;
    if (this.pausado) {
      this.limpiarPreview();
      this.pausarMusica();
    } else {
      this.iniciarPreview();
      this.reanudarMusica();
    }
  }

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

  /* ─── PREVIEW PROGRESS ─── */
  private iniciarPreview(): void {
    this.limpiarPreview();
    if (this.pausado) return;
    this.progresoPreview = 0;
    const duracion = (this.duracion || 5) * 1000;
    const pasos = 100;
    const intervalo = duracion / pasos;
    this.intervaloPreview = setInterval(() => {
      this.progresoPreview += 100 / pasos;
      if (this.progresoPreview >= 100) {
        this.progresoPreview = 100;
        this.limpiarPreview();
      }
      this.cdr.detectChanges();
    }, intervalo);
  }

  private limpiarPreview(): void {
    if (this.intervaloPreview) {
      clearInterval(this.intervaloPreview);
      this.intervaloPreview = null;
    }
  }

  /* ─── MÚSICA ─── */
  toggleBusquedaMusica(): void {
    this.mostrarBusquedaMusica = !this.mostrarBusquedaMusica;
    if (!this.mostrarBusquedaMusica) {
      this.consultaMusica = ''; this.resultadosMusica = []; this.buscandoMusica = false;
    }
  }

  onInputMusica(): void {
    if (this.timeoutBusqueda) clearTimeout(this.timeoutBusqueda);
    const q = this.consultaMusica.trim();
    if (q.length < 2) { this.resultadosMusica = []; this.buscandoMusica = false; return; }
    this.timeoutBusqueda = setTimeout(() => {
      this.buscandoMusica = true;
      this.musicaService.buscar(q).subscribe({
        next: (r) => { this.resultadosMusica = r; this.buscandoMusica = false; this.cdr.detectChanges(); },
        error: () => { this.resultadosMusica = []; this.buscandoMusica = false; this.cdr.detectChanges(); },
      });
    }, 400);
  }

  /* ─── PREVIEW EN BÚSQUEDA ─── */
  togglePreview(track: MusicTrack, event: Event): void {
    event.stopPropagation();
    if (!track.previewUrl) return;

    if (this.previewReproduciendo?.id === track.id && this.previewAudio) {
      if (!this.previewAudio.paused) {
        this.previewAudio.pause();
        this.previewReproduciendo = null;
      }
      return;
    }

    this.detenerPreview();
    this.previewReproduciendo = track;
    this.previewAudio = new Audio(track.previewUrl);
    this.previewAudio.volume = this.previewMuted ? 0 : 0.7;

    this.previewAudio.addEventListener('timeupdate', () => {
      if (this.previewAudio) {
        this.previewProgreso = (this.previewAudio.currentTime / this.previewAudio.duration) * 100;
      }
    });

    this.previewAudio.addEventListener('ended', () => {
      this.previewProgreso = 0;
      this.previewReproduciendo = null;
      this.previewAudio = null;
      this.cdr.detectChanges();
    });

    this.previewAudio.play().catch(() => {});
  }

  detenerPreview(): void {
    if (this.previewAudio) {
      this.previewAudio.pause();
      this.previewAudio = null;
    }
    this.previewReproduciendo = null;
    this.previewProgreso = 0;
  }

  toggleMutePreview(event: Event): void {
    event.stopPropagation();
    this.previewMuted = !this.previewMuted;
    if (this.previewAudio) {
      this.previewAudio.volume = this.previewMuted ? 0 : 0.7;
    }
  }

  seleccionarPista(track: MusicTrack): void {
    this.detenerPreview();
    this.pistaSeleccionada = track;
    this.mostrarBusquedaMusica = false;
    this.consultaMusica = ''; this.resultadosMusica = [];
    this.detenerMusica();
  }

  eliminarPista(): void {
    this.detenerPreview();
    this.detenerMusica();
    this.pistaSeleccionada = null;
  }

  toggleMusicaPreview(): void {
    if (!this.pistaSeleccionada?.previewUrl) return;
    if (this.musicaSonando) {
      this.detenerMusica();
    } else if (this.audioMusica) {
      // Resume from header-pause
      this.audioMusica.play().then(() => {
        this.musicaSonando = true;
        this.cdr.detectChanges();
      }).catch(() => {});
    } else {
      this.reproducirMusica();
    }
  }

  private reproducirMusica(): void {
    if (!this.pistaSeleccionada?.previewUrl) return;
    this.detenerMusica();
    this.audioMusica = new Audio(this.pistaSeleccionada.previewUrl);
    this.audioMusica.volume = this.muted ? 0 : this.volumen;
    this.audioMusica.addEventListener('ended', () => { this.musicaSonando = false; this.cdr.detectChanges(); });
    this.audioMusica.play().then(() => { this.musicaSonando = true; this.cdr.detectChanges(); }).catch(() => { this.musicaSonando = false; this.cdr.detectChanges(); });
  }

  private detenerMusica(): void {
    if (this.audioMusica) { this.audioMusica.pause(); this.audioMusica = null; }
    this.musicaSonando = false;
  }

  private limpiarMusica(): void {
    if (this.timeoutBusqueda) clearTimeout(this.timeoutBusqueda);
    this.detenerPreview();
    this.detenerMusica();
  }

  /* ─── PUBLICAR ─── */
  publicar(): void {
    if (!this.esValido || !this.user?.id || this.publicando) return;
    this.publicando = true;
    this.progresoSubida = 0;
    this.errorSubida = '';

    const intervalo = setInterval(() => {
      if (this.progresoSubida < 90) this.progresoSubida += Math.random() * 15;
      this.cdr.detectChanges();
    }, 300);

    this.suscripcionPublicar = this.historiaService
      .crear(
        this.user.id, this.texto,
        this.previewUrl && !this.esVideo ? '' : this.colorFondo,
        this.duracion,
        !this.esVideo ? this.archivo : null,
        this.esVideo ? this.archivo : null,
        this.pistaSeleccionada?.title,
        this.pistaSeleccionada?.artist,
        this.pistaSeleccionada?.previewUrl,
        this.pistaSeleccionada?.coverUrl,
      )
      .pipe(finalize(() => {
        this.publicando = false;
        clearInterval(intervalo);
        this.progresoSubida = 0;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (story) => {
          this.storyCreated.emit(story);
          this.close.emit();
        },
        error: (err) => {
          this.errorSubida = err.error?.message || 'Error al publicar la historia.';
          this.cdr.detectChanges();
        },
      });
  }

  cancelarSubida(): void {
    this.suscripcionPublicar?.unsubscribe();
    this.publicando = false;
    this.progresoSubida = 0;
    this.errorSubida = '';
    this.cdr.detectChanges();
  }
}
