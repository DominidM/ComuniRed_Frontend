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
    imagenFile: null as File | null,
    imagenPreview: null as string | null,
  };

  isValid(): boolean {
    return !!(
      this.form.titulo.trim() &&
      this.form.descripcion.trim() &&
      this.form.categoriaId
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }
    this.form.imagenFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.form.imagenPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.form.imagenFile = null;
    this.form.imagenPreview = null;
  }

  constructor(private quejaService: QuejaService) {}

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

    this.quejaService
      .crearQueja(
        this.form.titulo,
        this.form.descripcion,
        this.form.categoriaId,
        this.user.id,
        this.form.ubicacion || undefined,
        this.form.imagenFile || undefined,
        this.form.lat ?? undefined,
        this.form.lng ?? undefined,
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
