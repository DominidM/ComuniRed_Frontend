import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LoadingOverlayComponent } from '../../shared/components/loading/loading.component';
import { QuejaService, Queja, HistorialEvento } from '../../services/queja.service';
import { UsuarioService } from '../../services/usuario.service';
import { AsignacionService, Asignacion } from '../../services/asignacion.service';

interface Filtro {
  busqueda: string;
  estado: string;
  categoria: string;
  riesgo: string;
}

type Vista = 'mis' | 'todos';

@Component({
  selector: 'app-soporte-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingOverlayComponent],
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

  // Asignaciones del agente
  misAsignaciones: Asignacion[] = [];

  // Vistas
  vistaActual: Vista = 'mis';

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
    { clave: 'BAJO',    label: 'Bajo' },
    { clave: 'MEDIO',   label: 'Medio' },
    { clave: 'ALTO',    label: 'Alto' },
    { clave: 'CRITICO', label: 'Crítico' },
  ];

  // Contadores para stats
  counts = { mis: 0, todos: 0, resueltos: 0 };

  constructor(
    private quejaService: QuejaService,
    private usuarioService: UsuarioService,
    private asignacionService: AsignacionService,
  ) {}

  ngOnInit(): void {
    const u = this.usuarioService.getUser() as any;
    if (u) {
      this.agente = u;
      this.agenteId = u.id || u._id || '';
    }
    this.iniciarCarga();
  }

  private iniciarCarga(): void {
    this.quejasCargadas = false;
    this.asignacionesCargadas = false;
    this.cargarQuejas();
    this.cargarAsignaciones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── CARGA ────────────────────────────────────────────────
  refrescarTodo(): void {
    this.iniciarCarga();
  }

  cargarQuejas(): void {
    this.cargando = true;
    this.quejaService.obtenerQuejas(this.agenteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (quejas) => {
          this.todasLasQuejas = quejas.filter(q => {
            const clave = q.estado?.clave?.toLowerCase();
            return clave !== 'votacion' && clave !== 'nulo';
          });
          this.extraerCategorias();
          this.quejasCargadas = true;
          this.verificarCargaCompleta();
        },
        error: () => {
          this.mostrarToast('Error al cargar reportes', 'error');
          this.quejasCargadas = true;
          this.verificarCargaCompleta();
        },
      });
  }

  cargarAsignaciones(): void {
    if (!this.agenteId) {
      this.asignacionesCargadas = true;
      this.verificarCargaCompleta();
      return;
    }
    this.asignacionService.obtenerAsignacionesPorSoporte(this.agenteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (asignaciones) => {
          this.misAsignaciones = asignaciones.filter(a =>
            a.estado !== 'COMPLETADA' && a.estado !== 'CANCELADA'
          );
          this.asignacionesCargadas = true;
          this.verificarCargaCompleta();
        },
        error: () => {
          this.asignacionesCargadas = true;
          this.verificarCargaCompleta();
        }
      });
  }

  private quejasCargadas = false;
  private asignacionesCargadas = false;

  private verificarCargaCompleta(): void {
    if (this.quejasCargadas && this.asignacionesCargadas) {
      this.calcularContadores();
      this.aplicarFiltros();
      this.cargando = false;
    }
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
    this.counts.mis = this.misAsignaciones.length;
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
    if (this.vistaActual === 'mis') {
      lista = lista.filter(q =>
        this.misAsignaciones.some(a => a.queja_id === q.id)
      );
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

  cambiarEstado(queja: Queja, nuevoEstado: string, _observacion?: string): void {
    if (this.procesando[queja.id]) return;
    this.procesando[queja.id] = true;

    const asignacion = this.obtenerAsignacionDeQueja(queja.id);
    if (!asignacion) {
      this.procesando[queja.id] = false;
      this.mostrarToast('No se encontró la asignación para este reporte', 'error');
      return;
    }

    const estadoAsignacion = this.mapearEstadoAsignacion(nuevoEstado);

    this.asignacionService.cambiarEstadoAsignacion(asignacion.id, estadoAsignacion, this.agenteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (estadoAsignacion === 'COMPLETADA' || estadoAsignacion === 'CANCELADA') {
            this.misAsignaciones = this.misAsignaciones.filter(a => a.id !== asignacion.id);
          } else {
            const idx = this.misAsignaciones.findIndex(a => a.id === asignacion.id);
            if (idx !== -1) {
              this.misAsignaciones[idx] = { ...this.misAsignaciones[idx], estado: estadoAsignacion };
            }
          }
          this.calcularContadores();
          this.aplicarFiltros();
          this.procesando[queja.id] = false;
          this.mostrarToast(`Estado cambiado a ${nuevoEstado}`, 'ok');
          if (this.quejaSeleccionada?.id === queja.id) {
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
  private mapearEstadoAsignacion(estadoQueja: string): string {
    const mapa: { [k: string]: string } = {
      'EN_PROCESO': 'EN_PROCESO',
      'OBSERVADO': 'EN_PROCESO',
      'RESUELTO': 'COMPLETADA',
      'CANCELADO': 'CANCELADA',
    };
    return mapa[estadoQueja] || estadoQueja;
  }

  private obtenerAsignacionDeQueja(quejaId: string): Asignacion | undefined {
    return this.misAsignaciones.find(a => a.queja_id === quejaId);
  }

  esDeEsteAgente(queja: Queja | null): boolean {
    if (!queja) return false;
    return this.misAsignaciones.some(a => a.queja_id === queja.id);
  }

  getEstadoClave(queja: Queja | null): string {
    return queja?.estado?.clave?.toLowerCase() || '';
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