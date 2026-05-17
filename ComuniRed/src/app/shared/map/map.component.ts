import { Component, Input, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-wrapper" *ngIf="lat && lng">
      <button class="map-toggle" (click)="toggle()" [class.open]="expanded">
        <i class="pi pi-map-marker"></i>
        <span class="map-coords-text">{{ lat.toFixed(4) }}, {{ lng.toFixed(4) }}</span>
        <i [class]="expanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
      </button>
      <div class="map-expandable" [class.open]="expanded">
        <div #mapEl class="map-inner"></div>
      </div>
    </div>
  `,
  styles: [`
    .map-wrapper {
      display: inline-flex;
      flex-direction: column;
    }
    .map-toggle {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 0.78rem;
      color: var(--cr-primary, #6366f1);
      padding: 2px 6px;
      border-radius: 4px;
      transition: background 0.15s;
    }
    .map-toggle:hover {
      background: var(--cr-hover, #f3f4f6);
    }
    .map-coords-text {
      color: var(--cr-text-muted, #6b7280);
    }
    .map-expandable {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.25s ease;
      border-radius: 8px;
    }
    .map-expandable.open {
      max-height: 220px;
    }
    .map-inner {
      height: 200px;
      width: 260px;
      border-radius: 8px;
      border: 1px solid var(--cr-border, #e5e7eb);
      margin-top: 4px;
    }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @Input() lat!: number;
  @Input() lng!: number;
  @ViewChild('mapEl') mapEl!: ElementRef;

  expanded = false;
  private map: L.Map | null = null;
  private mapInitialized = false;

  ngAfterViewInit(): void {
    if (!this.lat || !this.lng) return;
  }

  private initMap(): void {
    if (this.mapInitialized || !this.mapEl?.nativeElement) return;
    this.mapInitialized = true;

    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    setTimeout(() => {
      this.map = L.map(this.mapEl.nativeElement, {
        center: [this.lat, this.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(this.map);

      L.marker([this.lat, this.lng], { icon })
        .addTo(this.map)
        .bindPopup('Ubicacion del reporte');

      setTimeout(() => this.map?.invalidateSize(), 100);
    }, 50);
  }

  toggle(): void {
    this.expanded = !this.expanded;
    if (this.expanded) this.initMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
