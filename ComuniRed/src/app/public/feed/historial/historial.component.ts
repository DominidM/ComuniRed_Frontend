import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Queja } from '../../../services/queja.service';
import { HistorialEvento, HistorialEventoService } from '../../../services/historial-evento.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent {
  @Input() queja: Queja | null = null;
  @Input() eventos: HistorialEvento[] = [];
  @Input() loading = false;

  @Output() closed = new EventEmitter<void>();

  constructor(private historialService: HistorialEventoService) {}

  getIcono(tipo: string): string  { return this.historialService.obtenerIconoPorTipo(tipo); }
  getTexto(tipo: string): string  { return this.historialService.obtenerTextoTipo(tipo); }
  getColor(tipo: string): string  { return this.historialService.obtenerColorPorTipo(tipo); }

  formatFecha(fecha: string): string {
    return this.historialService.formatearFechaRelativa(fecha);
  }

  hasRiesgo(): boolean { return !!this.queja?.nivel_riesgo; }

  getEstadoBadgeClass(): string {
    const map: { [k: string]: string } = {
      votacion: 'badge bg-primary', pendiente: 'badge bg-warning',
      aprobada: 'badge bg-success', asignada: 'badge bg-info',
      en_proceso: 'badge bg-info',  resuelto: 'badge bg-success',
      cancelado: 'badge bg-danger',
    };
    return map[this.queja?.estado?.clave || ''] || 'badge bg-secondary';
  }

  getRiesgoBadgeClass(): string {
    const map: { [k: string]: string } = {
      BAJO: 'badge bg-success', MEDIO: 'badge bg-warning',
      ALTO: 'badge bg-orange',  CRITICO: 'badge bg-danger',
    };
    return map[this.queja?.nivel_riesgo?.toUpperCase() || ''] || 'badge bg-secondary';
  }

  getRiesgoTexto(): string {
    const map: { [k: string]: string } = {
      BAJO: 'Riesgo Bajo', MEDIO: 'Riesgo Medio',
      ALTO: 'Riesgo Alto', CRITICO: '⚠️ Crítico',
    };
    return map[this.queja?.nivel_riesgo?.toUpperCase() || ''] || this.queja?.nivel_riesgo || '';
  }
}