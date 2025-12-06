import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface HistorialEvento {
  id: string;
  queja_id: string;
  tipo_evento: string;
  estado_anterior?: string;
  estado_nuevo?: string;
  descripcion: string;
  fecha_evento: string;
  usuario_id: string;
}


const HISTORIAL_POR_QUEJA = gql`
  query HistorialPorQueja($quejaId: ID!) {
    historialPorQueja(quejaId: $quejaId) {
      id
      queja_id
      tipo_evento
      estado_anterior
      estado_nuevo
      descripcion
      fecha_evento
      usuario_id
    }
  }
`;

const HISTORIAL_POR_TIPO = gql`
  query HistorialPorTipo($quejaId: ID!, $tipoEvento: String!) {
    historialPorTipo(quejaId: $quejaId, tipoEvento: $tipoEvento) {
      id
      queja_id
      tipo_evento
      estado_anterior
      estado_nuevo
      descripcion
      fecha_evento
      usuario_id
    }
  }
`;

const HISTORIAL_RECIENTE = gql`
  query HistorialReciente($quejaId: ID!, $limite: Int) {
    historialReciente(quejaId: $quejaId, limite: $limite) {
      id
      queja_id
      tipo_evento
      estado_anterior
      estado_nuevo
      descripcion
      fecha_evento
      usuario_id
    }
  }
`;


@Injectable({ providedIn: 'root' })
export class HistorialEventoService {
  constructor(private apollo: Apollo) {}

  obtenerHistorialPorQueja(quejaId: string): Observable<HistorialEvento[]> {
    return this.apollo
      .watchQuery<{ historialPorQueja: HistorialEvento[] }>({
        query: HISTORIAL_POR_QUEJA,
        variables: { quejaId },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(
        map(result => result.data.historialPorQueja)
      );
  }

  obtenerHistorialPorTipo(quejaId: string, tipoEvento: string): Observable<HistorialEvento[]> {
    return this.apollo
      .watchQuery<{ historialPorTipo: HistorialEvento[] }>({
        query: HISTORIAL_POR_TIPO,
        variables: { quejaId, tipoEvento },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(
        map(result => result.data.historialPorTipo)
      );
  }

  obtenerHistorialReciente(quejaId: string, limite: number = 5): Observable<HistorialEvento[]> {
    return this.apollo
      .watchQuery<{ historialReciente: HistorialEvento[] }>({
        query: HISTORIAL_RECIENTE,
        variables: { quejaId, limite },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(
        map(result => result.data.historialReciente)
      );
  }

  filtrarPorTipo(eventos: HistorialEvento[], tipo: string): HistorialEvento[] {
    return eventos.filter(e => e.tipo_evento === tipo);
  }

  obtenerEventosCreacion(eventos: HistorialEvento[]): HistorialEvento[] {
    return this.filtrarPorTipo(eventos, 'creada');
  }

  obtenerEventosAsignacion(eventos: HistorialEvento[]): HistorialEvento[] {
    return this.filtrarPorTipo(eventos, 'asignada');
  }

  obtenerEventosClasificacion(eventos: HistorialEvento[]): HistorialEvento[] {
    return this.filtrarPorTipo(eventos, 'clasificada');
  }

  obtenerEventosCambioEstado(eventos: HistorialEvento[]): HistorialEvento[] {
    return this.filtrarPorTipo(eventos, 'cambio_estado');
  }

  obtenerEventosReasignacion(eventos: HistorialEvento[]): HistorialEvento[] {
    return this.filtrarPorTipo(eventos, 'reasignada');
  }

  ordenarPorFecha(eventos: HistorialEvento[], ascendente: boolean = false): HistorialEvento[] {
    return [...eventos].sort((a, b) => {
      const fechaA = new Date(a.fecha_evento).getTime();
      const fechaB = new Date(b.fecha_evento).getTime();
      return ascendente ? fechaA - fechaB : fechaB - fechaA;
    });
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearFechaRelativa(fecha: string): string {
    const date = new Date(fecha);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 172800) return 'hace 1 día';
    if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return this.formatearFecha(fecha);
  }

  obtenerIconoPorTipo(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'creada': '📝',
      'asignada': '👤',
      'reasignada': '🔄',
      'clasificada': '⚠️',
      'cambio_estado': '🔔',
      'comentario': '💬',
      'evidencia': '📎',
      'resuelta': '✅',
      'cerrada': '🔒'
    };
    return iconos[tipo] || '📌';
  }

  obtenerColorPorTipo(tipo: string): string {
    const colores: { [key: string]: string } = {
      'creada': 'primary',
      'asignada': 'info',
      'reasignada': 'warning',
      'clasificada': 'danger',
      'cambio_estado': 'secondary',
      'comentario': 'light',
      'evidencia': 'dark',
      'resuelta': 'success',
      'cerrada': 'secondary'
    };
    return colores[tipo] || 'secondary';
  }

  obtenerTextoTipo(tipo: string): string {
    const textos: { [key: string]: string } = {
      'creada': 'Creada',
      'asignada': 'Asignada',
      'reasignada': 'Reasignada',
      'clasificada': 'Clasificada',
      'cambio_estado': 'Cambio de Estado',
      'comentario': 'Comentario',
      'evidencia': 'Evidencia Agregada',
      'resuelta': 'Resuelta',
      'cerrada': 'Cerrada'
    };
    return textos[tipo] || tipo;
  }

  contarEventosPorTipo(eventos: HistorialEvento[]): { [key: string]: number } {
    return eventos.reduce((acc, evento) => {
      acc[evento.tipo_evento] = (acc[evento.tipo_evento] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  obtenerUltimoEvento(eventos: HistorialEvento[]): HistorialEvento | null {
    if (eventos.length === 0) return null;
    return this.ordenarPorFecha(eventos, false)[0];
  }

  obtenerPrimerEvento(eventos: HistorialEvento[]): HistorialEvento | null {
    if (eventos.length === 0) return null;
    return this.ordenarPorFecha(eventos, true)[0];
  }

  filtrarPorFecha(eventos: HistorialEvento[], fechaInicio: Date, fechaFin: Date): HistorialEvento[] {
    return eventos.filter(e => {
      const fecha = new Date(e.fecha_evento);
      return fecha >= fechaInicio && fecha <= fechaFin;
    });
  }

  obtenerEventosHoy(eventos: HistorialEvento[]): HistorialEvento[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    return this.filtrarPorFecha(eventos, hoy, manana);
  }

  obtenerEventosSemana(eventos: HistorialEvento[]): HistorialEvento[] {
    const hoy = new Date();
    const hace7Dias = new Date(hoy);
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    return this.filtrarPorFecha(eventos, hace7Dias, hoy);
  }
}
