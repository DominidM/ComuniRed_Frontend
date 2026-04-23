import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { QuejaService, Queja, HistorialEvento } from '../../services/queja.service';
import { UsuarioService } from '../../services/usuario.service';

interface Filtro {
  busqueda: string;
  estado: string;
  categoria: string;
  riesgo: string;
}

type Vista = 'pendientes' | 'mis' | 'todos';

@Component({
  selector: 'app-soporte-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './soporte-seguimiento.component.html',
  styleUrls: ['./soporte-seguimiento.component.css'],
})
export class SoporteSeguimientoComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Datos del agente logueado
  agente: any = null;
  agenteId = '';

  // Quejas
  todasLasQuejas: Queja[] = [];
  quejasFiltradas: Queja[] = [];
  quejaSeleccionada: Queja | null = null;

  // Vistas
  vistaActual: Vista = 'pendientes';

  // Filtros
  filtro: Filtro = { busqueda: '', estado: '', categoria: '', riesgo: '' };
  categorias: { id: string; nombre: string }[] = [];

  // Modales
  modalDetalle = false;
  modalCancelar = false;
  quejaPorCancelar: Queja | null = null;
  motivoCancelacion = '';
  observacionTexto = '';

  // Historial
  historialEventos: HistorialEvento[] = [];
  historialCargando = false;

  // Estados
  cargando = false;
  procesando: { [id: string]: boolean } = {};

  // Toast
  toast = { visible: false, mensaje: '', tipo: 'ok' };

  // Niveles de riesgo
  niveles = [
    { clave: 'BAJO',    label: 'Bajo',    icon: '🟢' },
    { clave: 'MEDIO',   label: 'Medio',   icon: '🟡' },
    { clave: 'ALTO',    label: 'Alto',    icon: '🟠' },
    { clave: 'CRITICO', label: 'Crítico', icon: '🔴' },
  ];

  // Contadores para stats
  counts = { pendientes: 0, mis: 0, todos: 0, resueltos: 0 };

  constructor(
    private quejaService: QuejaService,
    private usuarioService: UsuarioService,
  ) {}

  ngOnInit(): void {
    const u = this.usuarioService.getUser() as any;
    if (u) {
      this.agente = u;
      this.agenteId = u.id || u._id || '';
    }
    this.cargarQuejas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── CARGA ────────────────────────────────────────────────
  cargarQuejas(): void {
    this.cargando = true;
    this.quejaService.obtenerQuejas(this.agenteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (quejas) => {
          // Soporte ve todos excepto los en VOTACION (esos son del feed público)
          this.todasLasQuejas = quejas.filter(q => {
            const clave = q.estado?.clave?.toLowerCase();
            return clave !== 'votacion' && clave !== 'nulo';
          });
          this.extraerCategorias();
          this.calcularContadores();
          this.aplicarFiltros();
          this.cargando = false;
        },
        error: () => {
          this.mostrarToast('Error al cargar reportes', 'error');
          this.cargando = false;
        },
      });
  }

  private extraerCategorias(): void {
    const mapa = new Map<string, string>();
    this.todasLasQuejas.forEach(q => {
      if (q.categoria?.id) mapa.set(q.categoria.id, q.categoria.nombre);
    });
    this.categorias = Array.from(mapa.entries()).map(([id, nombre]) => ({ id, nombre }));
  }

  private calcularContadores(): void {
    this.counts.todos = this.todasLasQuejas.length;
    this.counts.pendientes = this.todasLasQuejas.filter(q =>
      q.estado?.clave?.toLowerCase() === 'pendiente'
    ).length;
    this.counts.mis = this.todasLasQuejas.filter(q =>
      this.esDeEsteAgente(q) &&
      ['asignada', 'en_proceso', 'observado'].includes(q.estado?.clave?.toLowerCase() || '')
    ).length;
    this.counts.resueltos = this.todasLasQuejas.filter(q =>
      q.estado?.clave?.toLowerCase() === 'resuelto'
    ).length;
  }

  // ── FILTROS / VISTA ───────────────────────────────────────
  setVista(v: Vista): void {
    this.vistaActual = v;
    this.filtro.estado = '';
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let lista = [...this.todasLasQuejas];

    // Filtro por vista
    switch (this.vistaActual) {
      case 'pendientes':
        lista = lista.filter(q => q.estado?.clave?.toLowerCase() === 'pendiente');
        break;
      case 'mis':
        lista = lista.filter(q =>
          this.esDeEsteAgente(q) &&
          ['asignada', 'en_proceso', 'observado'].includes(q.estado?.clave?.toLowerCase() || '')
        );
        break;
    }

    // Filtro por estado (solo en "todos")
    if (this.filtro.estado) {
      lista = lista.filter(q =>
        q.estado?.clave?.toLowerCase() === this.filtro.estado.toLowerCase()
      );
    }

    // Filtro por categoría
    if (this.filtro.categoria) {
      lista = lista.filter(q => q.categoria?.id === this.filtro.categoria);
    }

    // Filtro por riesgo
    if (this.filtro.riesgo) {
      lista = lista.filter(q =>
        q.nivel_riesgo?.toUpperCase() === this.filtro.riesgo
      );
    }

    // Búsqueda de texto
    if (this.filtro.busqueda.trim()) {
      const txt = this.filtro.busqueda.toLowerCase();
      lista = lista.filter(q =>
        q.titulo.toLowerCase().includes(txt) ||
        q.descripcion.toLowerCase().includes(txt) ||
        (q.ubicacion || '').toLowerCase().includes(txt) ||
        `${q.usuario?.nombre} ${q.usuario?.apellido}`.toLowerCase().includes(txt)
      );
    }

    // Ordenar: críticos primero, luego por fecha
    lista.sort((a, b) => {
      const riesgoOrden: { [k: string]: number } = { CRITICO: 0, ALTO: 1, MEDIO: 2, BAJO: 3 };
      const ra = riesgoOrden[a.nivel_riesgo || ''] ?? 4;
      const rb = riesgoOrden[b.nivel_riesgo || ''] ?? 4;
      if (ra !== rb) return ra - rb;
      return new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime();
    });

    this.quejasFiltradas = lista;
  }

  // ── ACCIONES ─────────────────────────────────────────────

  tomarReporte(queja: Queja): void {
    if (this.procesando[queja.id]) return;
    this.procesando[queja.id] = true;

    this.quejaService.cambiarEstadoQueja(queja.id, this.agenteId, 'ASIGNADA', 
      `Reporte tomado por el agente`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (actualizada) => {
          this.actualizarQuejaLocal(actualizada);
          this.calcularContadores();
          this.aplicarFiltros();
          this.procesando[queja.id] = false;
          this.mostrarToast('Reporte asignado a ti ✅', 'ok');
          // Si el modal está abierto, actualizar
          if (this.quejaSeleccionada?.id === queja.id) {
            this.quejaSeleccionada = actualizada;
          }
        },
        error: () => {
          this.procesando[queja.id] = false;
          this.mostrarToast('Error al tomar el reporte', 'error');
        },
      });
  }

  cambiarEstado(queja: Queja, nuevoEstado: string, observacion?: string): void {
    if (this.procesando[queja.id]) return;
    this.procesando[queja.id] = true;

    this.quejaService.cambiarEstadoQueja(queja.id, this.agenteId, nuevoEstado, observacion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (actualizada) => {
          this.actualizarQuejaLocal(actualizada);
          this.calcularContadores();
          this.aplicarFiltros();
          this.procesando[queja.id] = false;
          this.mostrarToast(`Estado cambiado a ${nuevoEstado}`, 'ok');
          if (this.quejaSeleccionada?.id === queja.id) {
            this.quejaSeleccionada = actualizada;
            this.cargarHistorial(queja.id);
          }
        },
        error: () => {
          this.procesando[queja.id] = false;
          this.mostrarToast('Error al cambiar estado', 'error');
        },
      });
  }

  clasificarRiesgo(queja: Queja, nivel: string): void {
    this.quejaService.clasificarRiesgo(queja.id, this.agenteId, nivel)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (actualizada) => {
          this.actualizarQuejaLocal(actualizada);
          if (this.quejaSeleccionada?.id === queja.id) {
            this.quejaSeleccionada = { ...this.quejaSeleccionada, nivel_riesgo: actualizada.nivel_riesgo };
          }
          this.mostrarToast(`Riesgo clasificado como ${nivel}`, 'ok');
        },
        error: () => this.mostrarToast('Error al clasificar riesgo', 'error'),
      });
  }

  guardarObservacion(queja: Queja): void {
    if (!this.observacionTexto.trim()) return;
    this.cambiarEstado(queja, 'OBSERVADO', this.observacionTexto.trim());
    this.observacionTexto = '';
  }

  abrirObservacion(queja: Queja): void {
    this.quejaSeleccionada = queja;
    this.modalDetalle = true;
    this.cargarHistorial(queja.id);
    // Scroll al textarea de observación
    setTimeout(() => document.querySelector<HTMLTextAreaElement>('.obs-textarea')?.focus(), 300);
  }

  abrirCancelar(queja: Queja): void {
    this.quejaPorCancelar = queja;
    this.motivoCancelacion = '';
    this.modalCancelar = true;
  }

  confirmarCancelar(): void {
    if (!this.quejaPorCancelar || !this.motivoCancelacion.trim()) return;
    this.cambiarEstado(this.quejaPorCancelar, 'CANCELADO', this.motivoCancelacion);
    this.modalCancelar = false;
    this.quejaPorCancelar = null;
    if (this.modalDetalle) this.cerrarDetalle();
  }

  // ── DETALLE / HISTORIAL ──────────────────────────────────
  abrirDetalle(queja: Queja): void {
    this.quejaSeleccionada = queja;
    this.modalDetalle = true;
    this.observacionTexto = '';
    this.cargarHistorial(queja.id);
  }

  cerrarDetalle(): void {
    this.modalDetalle = false;
    this.quejaSeleccionada = null;
    this.historialEventos = [];
  }

  abrirHistorial(queja: Queja): void {
    this.abrirDetalle(queja);
  }

  cargarHistorial(quejaId: string): void {
    this.historialCargando = true;
    this.quejaService.obtenerHistorialPorQueja(quejaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (eventos) => {
          this.historialEventos = eventos.sort((a, b) =>
            new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime()
          );
          this.historialCargando = false;
        },
        error: () => {
          this.historialCargando = false;
        },
      });
  }

  // ── HELPERS ──────────────────────────────────────────────
  esDeEsteAgente(queja: Queja | null): boolean {
    if (!queja) return false;
    // Por ahora cualquier soporte puede gestionar los asignados
    // Cuando agregues asignado_a_id: return (queja as any).asignado_a_id === this.agenteId
    const clave = queja.estado?.clave?.toLowerCase() || '';
    return ['asignada', 'en_proceso', 'observado'].includes(clave);
  }

  getEstadoClave(queja: Queja | null): string {
    return queja?.estado?.clave?.toLowerCase() || '';
  }

  getRiesgoIcon(nivel?: string): string {
    switch (nivel?.toUpperCase()) {
      case 'BAJO':    return '🟢';
      case 'MEDIO':   return '🟡';
      case 'ALTO':    return '🟠';
      case 'CRITICO': return '🔴';
      default:        return '⚪';
    }
  }

  getTipoIcono(tipo: string): string {
    const map: { [k: string]: string } = {
      creada: '📝', estado_cambiado: '🔄', clasificada: '🏷️',
      comentario: '💬', asignada: '👤', observacion: '👁️',
    };
    return map[tipo] || '📌';
  }

  getTipoTexto(tipo: string): string {
    const map: { [k: string]: string } = {
      creada: 'Reporte creado', estado_cambiado: 'Estado cambiado',
      clasificada: 'Riesgo clasificado', comentario: 'Comentario agregado',
      asignada: 'Reporte asignado', observacion: 'Observación registrada',
    };
    return map[tipo] || tipo;
  }

  getTipoColor(tipo: string): string {
    const map: { [k: string]: string } = {
      creada: 'blue', estado_cambiado: 'purple', clasificada: 'orange',
      comentario: 'gray', asignada: 'teal', observacion: 'yellow',
    };
    return map[tipo] || 'gray';
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return 'hace un momento';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    if (diff < 172800) return 'ayer';
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatFechaCorta(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) +
           ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  private actualizarQuejaLocal(actualizada: Queja): void {
    const idx = this.todasLasQuejas.findIndex(q => q.id === actualizada.id);
    if (idx !== -1) {
      this.todasLasQuejas[idx] = { ...this.todasLasQuejas[idx], ...actualizada };
    }
  }

  mostrarToast(mensaje: string, tipo: 'ok' | 'error' = 'ok'): void {
    this.toast = { visible: true, mensaje, tipo };
    setTimeout(() => { this.toast.visible = false; }, 3000);
  }
}