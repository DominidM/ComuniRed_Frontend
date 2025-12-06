import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuejaService, Queja } from '../../services/queja.service';
import { AsignacionService, Asignacion } from '../../services/asignacion.service';
import { UsuarioService } from '../../services/usuario.service';

interface NivelRiesgo {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
  total: number;
  prioridad: number;
}

@Component({
  selector: 'app-clasificacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './soporte-clasificacion.component.html',
  styleUrls: ['./soporte-clasificacion.component.css']
})
export class SoporteClasificacionComponent implements OnInit {
  asignaciones: Asignacion[] = [];
  quejas: Queja[] = [];
  quejasFiltradas: Queja[] = [];
  
  mostrarModal: boolean = false;
  mostrarModalImagen: boolean = false;
  imagenSeleccionada: string = '';
  quejaSeleccionada: Queja | null = null;
  nivelSeleccionadoModal: string = '';
  nivelSeleccionadoObj: NivelRiesgo | null = null;
  
  nivelesRiesgo: NivelRiesgo[] = [
    {
      id: 'CRITICO',
      nombre: 'Crítico',
      descripcion: 'Requiere atención inmediata - Riesgo alto para la comunidad',
      color: '#dc2626',
      icono: '🔴',
      total: 0,
      prioridad: 1
    },
    {
      id: 'ALTO',
      nombre: 'Alto',
      descripcion: 'Problema grave que debe resolverse pronto',
      color: '#ea580c',
      icono: '🟠',
      total: 0,
      prioridad: 2
    },
    {
      id: 'MEDIO',
      nombre: 'Medio',
      descripcion: 'Problema moderado que requiere seguimiento',
      color: '#f59e0b',
      icono: '🟡',
      total: 0,
      prioridad: 3
    },
    {
      id: 'BAJO',
      nombre: 'Bajo',
      descripcion: 'Problema menor sin urgencia inmediata',
      color: '#22c55e',
      icono: '🟢',
      total: 0,
      prioridad: 4
    },
    {
      id: 'INFORMATIVO',
      nombre: 'Informativo',
      descripcion: 'Solo información, no requiere acción urgente',
      color: '#3b82f6',
      icono: 'ℹ️',
      total: 0,
      prioridad: 5
    },
    {
      id: 'SIN_CLASIFICAR',
      nombre: 'Sin Clasificar',
      descripcion: 'Reportes pendientes de clasificación',
      color: '#6b7280',
      icono: '❓',
      total: 0,
      prioridad: 6
    }
  ];

  nivelSeleccionado: string = '';
  busqueda: string = '';
  loading: boolean = false;

  constructor(
    private quejaService: QuejaService,
    private asignacionService: AsignacionService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarQuejasAsignadas();
  }

  cargarQuejasAsignadas(): void {
    this.loading = true;
    const currentUser = this.usuarioService.getUser();
    
    if (!currentUser) {
      console.error('❌ No hay usuario autenticado');
      this.loading = false;
      return;
    }

    const soporteId = (currentUser as any).id;

    this.asignacionService.obtenerAsignacionesPorSoporte(soporteId).subscribe({
      next: (asignaciones) => {
        this.asignaciones = asignaciones;
        
        if (asignaciones.length === 0) {
          this.quejas = [];
          this.quejasFiltradas = [];
          this.calcularTotales();
          this.loading = false;
          return;
        }

        const quejaIds = [...new Set(asignaciones.map(a => a.queja_id))];

        this.quejaService.obtenerQuejasAprobadas(soporteId).subscribe({
          next: (quejasAprobadas) => {
            this.quejas = quejasAprobadas.filter(q => quejaIds.includes(q.id));
            this.quejasFiltradas = [...this.quejas];
            this.calcularTotales();
            this.loading = false;
          },
          error: (err) => {
            console.error('❌ Error cargando quejas aprobadas:', err);
            alert('Error al cargar las quejas aprobadas');
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('❌ Error cargando asignaciones:', err);
        alert('Error al cargar las asignaciones');
        this.loading = false;
      }
    });
  }

  verDetalleQueja(quejaId: string): void {
    window.open(`/public/feed/queja/${quejaId}`, '_blank')
  }

  verDetalleQuejaDesdeModal(): void {
    if (this.quejaSeleccionada) {
      this.cerrarModal();
      window.open(`/public/feed/queja/${this.quejaSeleccionada.id}`, '_blank');
    }
  }

  verImagenCompleta(imagenUrl: string | undefined): void {
    if (!imagenUrl) return;
    this.imagenSeleccionada = imagenUrl;
    this.mostrarModalImagen = true;
  }

  cerrarModalImagen(): void {
    this.mostrarModalImagen = false;
    this.imagenSeleccionada = '';
  }

  abrirModalClasificacion(queja: Queja, nivelId: string): void {
    if (!nivelId || nivelId === '') {
      return;
    }

    this.quejaSeleccionada = queja;
    this.nivelSeleccionadoModal = nivelId;
    this.nivelSeleccionadoObj = this.nivelesRiesgo.find(n => n.id === nivelId) || null;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.quejaSeleccionada = null;
    this.nivelSeleccionadoModal = '';
    this.nivelSeleccionadoObj = null;
  }

  confirmarClasificacion(): void {
    if (!this.quejaSeleccionada || !this.nivelSeleccionadoModal) {
      return;
    }

    this.loading = true;
    const currentUser = this.usuarioService.getUser();
    
    if (!currentUser) {
      alert('❌ No hay usuario autenticado');
      this.loading = false;
      return;
    }

    const nivel = this.nivelesRiesgo.find(n => n.id === this.nivelSeleccionadoModal);

    this.quejaService.clasificarRiesgo(
      this.quejaSeleccionada.id,
      (currentUser as any).id,
      this.nivelSeleccionadoModal,
      `Clasificado como ${nivel?.nombre}`
    ).subscribe({
      next: (quejaActualizada) => {
        const index = this.quejas.findIndex(q => q.id === this.quejaSeleccionada!.id);
        if (index !== -1) {
          this.quejas[index] = { ...this.quejas[index], ...quejaActualizada };
        }
        
        this.calcularTotales();
        this.aplicarBusqueda();
        this.loading = false;
        this.cerrarModal();
        
        alert(`✅ Queja clasificada como ${nivel?.nombre}`);
      },
      error: (err) => {
        console.error('❌ Error clasificando queja:', err);
        alert('❌ Error al clasificar la queja. Intenta nuevamente.');
        this.loading = false;
      }
    });
  }

  calcularTotales(): void {
    this.nivelesRiesgo.forEach(nivel => {
      if (nivel.id === 'SIN_CLASIFICAR') {
        nivel.total = this.quejas.filter(q => !q.nivel_riesgo || q.nivel_riesgo === '').length;
      } else {
        nivel.total = this.quejas.filter(q => q.nivel_riesgo?.toUpperCase() === nivel.id).length;
      }
    });
  }

  seleccionarNivel(nivelId: string): void {
    if (this.nivelSeleccionado === nivelId) {
      this.nivelSeleccionado = '';
      this.quejasFiltradas = [...this.quejas];
    } else {
      this.nivelSeleccionado = nivelId;
      
      if (nivelId === 'SIN_CLASIFICAR') {
        this.quejasFiltradas = this.quejas.filter(q => !q.nivel_riesgo || q.nivel_riesgo === '');
      } else {
        this.quejasFiltradas = this.quejas.filter(q => q.nivel_riesgo?.toUpperCase() === nivelId);
      }
    }
    this.aplicarBusqueda();
  }

  aplicarBusqueda(): void {
    let filtradas = this.nivelSeleccionado 
      ? this.quejas.filter(q => {
          if (this.nivelSeleccionado === 'SIN_CLASIFICAR') {
            return !q.nivel_riesgo || q.nivel_riesgo === '';
          }
          return q.nivel_riesgo?.toUpperCase() === this.nivelSeleccionado;
        })
      : [...this.quejas];

    if (this.busqueda.trim()) {
      filtradas = filtradas.filter(q =>
        q.titulo.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        q.descripcion.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        q.ubicacion?.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    }

    this.quejasFiltradas = filtradas;
  }

  getNombreNivelSeleccionado(): string {
    const nivel = this.nivelesRiesgo.find(n => n.id === this.nivelSeleccionado);
    return nivel ? nivel.nombre : 'Nivel';
  }

  getNivelNombre(nivelRiesgo?: string): string {
    if (!nivelRiesgo || nivelRiesgo === '') return 'Sin clasificar';
    const nivel = this.nivelesRiesgo.find(n => n.id === nivelRiesgo.toUpperCase());
    return nivel ? nivel.nombre : 'Sin clasificar';
  }

  getNivelColor(nivelRiesgo?: string): string {
    if (!nivelRiesgo || nivelRiesgo === '') return '#6b7280';
    const nivel = this.nivelesRiesgo.find(n => n.id === nivelRiesgo.toUpperCase());
    return nivel ? nivel.color : '#6b7280';
  }

  getNivelIcono(nivelRiesgo?: string): string {
    if (!nivelRiesgo || nivelRiesgo === '') return '❓';
    const nivel = this.nivelesRiesgo.find(n => n.id === nivelRiesgo.toUpperCase());
    return nivel ? nivel.icono : '❓';
  }

  get totalQuejas(): number {
    return this.quejas.length;
  }

  get quejasSinClasificar(): number {
    return this.quejas.filter(q => !q.nivel_riesgo || q.nivel_riesgo === '').length;
  }

  get porcentajeClasificado(): number {
    if (this.totalQuejas === 0) return 0;
    return Math.round(((this.totalQuejas - this.quejasSinClasificar) / this.totalQuejas) * 100);
  }

  get quejasCriticas(): number {
    return this.quejas.filter(q => q.nivel_riesgo?.toUpperCase() === 'CRITICO').length;
  }

  recargarQuejas(): void {
    this.cargarQuejasAsignadas();
  }
}
