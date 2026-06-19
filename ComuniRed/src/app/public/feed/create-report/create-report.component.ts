import {
  Component, Input, Output, EventEmitter, OnInit, AfterViewInit,
  ViewChild, ElementRef, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { QuejaService, Queja } from '../../../services/queja.service';
import {
  CategoriaService,
  Categoria,
} from '../../../services/categoria.service';
import { MusicaService, MusicTrackResponse } from '../../../services/musica.service';



@Component({
  selector: 'app-create-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-report.component.html',
  styleUrls: ['./create-report.component.css'],
})
export class CreateReportComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() user: { id?: string; name: string; avatarUrl: string } | null = null;
  @Input() categorias: Categoria[] = [];

  @Output() created = new EventEmitter<Queja>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  loading = false;
  showSuccess = false;
  successQueja: Queja | null = null;

  form = {
    titulo: '',
    descripcion: '',
    categoriaId: '',
    ubicacion: '',
    lat: null as number | null,
    lng: null as number | null,
    imagenFiles: [] as File[],
    imagenPreviews: [] as string[],
    musicaQuery: '',
    musicaResults: [] as MusicTrackResponse[],
    musicaBuscando: false,
    musicaSeleccionada: null as MusicTrackResponse | null,
  };

  previewAudio: HTMLAudioElement | null = null;
  previewReproduciendo: MusicTrackResponse | null = null;
  previewProgreso = 0;
  previewMuted = false;

  isValid(): boolean {
    return !!(
      this.form.titulo.trim() &&
      this.form.descripcion.trim() &&
      this.form.categoriaId
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      if (file.size > 5 * 1024 * 1024) continue;
      if (!file.type.startsWith('image/')) continue;
      this.form.imagenFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.form.imagenPreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  removeImage(index: number): void {
    this.form.imagenFiles.splice(index, 1);
    this.form.imagenPreviews.splice(index, 1);
  }

  buscarMusica(): void {
    const q = this.form.musicaQuery.trim();
    if (!q) return;
    this.form.musicaBuscando = true;
    this.musicaService.buscar(q).subscribe({
      next: (results) => {
        this.form.musicaResults = results;
        this.form.musicaBuscando = false;
      },
      error: () => {
        this.form.musicaBuscando = false;
      },
    });
  }

  togglePreview(track: MusicTrackResponse, event: Event): void {
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

  toggleMute(event: Event): void {
    event.stopPropagation();
    this.previewMuted = !this.previewMuted;
    if (this.previewAudio) {
      this.previewAudio.volume = this.previewMuted ? 0 : 0.7;
    }
  }

  seleccionarMusica(track: MusicTrackResponse): void {
    this.detenerPreview();
    this.form.musicaSeleccionada = track;
    this.form.musicaResults = [];
    this.form.musicaQuery = `${track.title} - ${track.artist}`;
  }

  quitarMusica(): void {
    this.detenerPreview();
    this.form.musicaSeleccionada = null;
    this.form.musicaQuery = '';
  }

  constructor(
    private quejaService: QuejaService,
    private musicaService: MusicaService,
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (!this.mapContainer) return;
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [-12.0464, -77.0428],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.setMarker(e.latlng.lat, e.latlng.lng);
    });
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    this.detenerPreview();
  }

  private setMarker(lat: number, lng: number): void {
    if (this.marker) this.marker.remove();
    this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map!);
    this.marker.on('dragend', () => {
      const pos = this.marker!.getLatLng();
      this.form.lat = pos.lat;
      this.form.lng = pos.lng;
    });
    this.form.lat = lat;
    this.form.lng = lng;
    this.form.ubicacion = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  submit(): void {
    if (!this.isValid() || !this.user?.id) return;
    this.loading = true;

    const files = this.form.imagenFiles.length > 0 ? this.form.imagenFiles : undefined;
    const musica = this.form.musicaSeleccionada;

    this.quejaService
      .crearQueja(
        this.form.titulo,
        this.form.descripcion,
        this.form.categoriaId,
        this.user.id,
        this.form.ubicacion || undefined,
        files,
        this.form.lat ?? undefined,
        this.form.lng ?? undefined,
        musica?.previewUrl,
        musica?.title,
        musica?.artist,
        musica?.coverUrl,
      )
      .subscribe({
        next: (queja) => {
          this.loading = false;
          this.successQueja = queja;
          this.showSuccess = true;
          setTimeout(() => {
            this.created.emit(queja);
          }, 1500);
        },
        error: (err) => {
          console.error('Error creando reporte:', err);
          this.loading = false;
          this.toast('Error al publicar el reporte');
        },
      });
  }

  private toastMsg = '';
  toast(msg: string): void {
    console.error(msg);
  }
}
