import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AsignacionService, Asignacion } from '../../services/asignacion.service';
import { QuejaService } from '../../services/queja.service';
import { UsuarioService } from '../../services/usuario.service';
import { LoadingOverlayComponent } from '../../shared/components/loading/loading.component';
import {
  DataTableComponent,
  DataTableColumn,
  DataTableCellDirective,
} from '../../shared/components/data-table/data-table.component';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';
import { AdminSearchComponent } from '../../shared/components/admin-search/admin-search.component';

interface QuejaParaAsignar {
  id: string;
  titulo: string;
  descripcion: string;
  votes: { total: number };
  usuario: { nombre: string; apellido: string };
  categoria: { nombre: string };
  fecha_creacion: string;
  estaAsignada?: boolean;
  asignaciones?: Asignacion[];
}

interface UsuarioSoporte {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

@Component({
  selector: 'app-crud-asignacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingOverlayComponent, DataTableComponent, DataTableCellDirective, WorkspaceHeaderComponent, AdminSearchComponent],
  templateUrl: './crud-asignacion.component.html',
  styleUrls: ['./crud-asignacion.component.css']
})
export class CrudAsignacionComponent implements OnInit {
  asignaciones: Asignacion[] = [];
  asignacionesFiltradas: Asignacion[] = [];
  asignacionesPaginadas: Asignacion[] = [];
  quejasDisponibles: QuejaParaAsignar[] = [];
  usuariosSoporte: UsuarioSoporte[] = [];
  
  loading = false;
  asignandoAutomatico = false;

  columns: DataTableColumn[] = [
    { key: 'soporte', label: 'Soporte Asignado' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha_asignacion', label: 'Fecha Asignacion' },
    { key: 'observacion', label: 'Observacion' },
    { key: 'acciones', label: 'Acciones' },
  ];

  pageSize: number = 5;
  pageSizes: number[] = [5, 10, 20, 50];
  totalAsignaciones: number = 0;
  page: number = 0;
  totalPages: number = 1;
  showModal = false;
  showQuejasModal = false;
  showReasignarModal = false;
  
  filtroEstado: string = 'todos';
  filtroTexto: string = '';
  
  asignacionSeleccionada: Asignacion | null = null;
  asignacionParaReasignar: Asignacion | null = null;
  
  nuevaAsignacion = {
    quejaId: '',
    soporteId: '',
    observacion: ''
  };

  datosReasignacion = {
    nuevoSoporteId: '',
    motivo: ''
  };

  constructor(
    private asignacionService: AsignacionService,
    private quejaService: QuejaService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.cargarAsignaciones();
    this.cargarQuejasConMasDe5Votos();
    this.cargarUsuariosSoporte();
  }

  cargarAsignaciones(): void {
    this.asignacionService.obtenerAsignacionesActivas().subscribe({
      next: (data) => {
        this.asignaciones = data;
        this.aplicarFiltros();
        this.verificarQuejasAsignadas();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  cargarQuejasConMasDe5Votos(): void {
    const currentUser = this.usuarioService.getUser();
    if (!currentUser) return;

    this.quejaService.obtenerQuejasAprobadas((currentUser as any).id).subscribe({
      next: (quejas: any[]) => {
        this.quejasDisponibles = quejas
          .filter(q => q.votes?.total >= 5)
          .map(q => ({
            ...q,
            estaAsignada: false,
            asignaciones: []
          }));
        
        this.verificarQuejasAsignadas();
      },
      error: () => {}
    });
  }

  verificarQuejasAsignadas(): void {
    if (this.quejasDisponibles.length === 0 || this.asignaciones.length === 0) {
      return;
    }

    this.quejasDisponibles.forEach(queja => {
      const asignacionesDeQueja = this.asignaciones.filter(a => a.queja_id === queja.id);
      queja.estaAsignada = asignacionesDeQueja.length > 0;
      queja.asignaciones = asignacionesDeQueja;
    });
  }

  obtenerTextoAsignacion(queja: QuejaParaAsignar): string {
    if (!queja.estaAsignada || !queja.asignaciones || queja.asignaciones.length === 0) {
      return '';
    }

    const asignacionesActivas = queja.asignaciones.filter(a => 
      a.estado !== 'COMPLETADA' && a.estado !== 'CANCELADA'
    );

    if (asignacionesActivas.length === 0) {
      return 'Completada/Cancelada';
    }

    if (asignacionesActivas.length === 1) {
      const soporte = this.obtenerNombreSoporte(asignacionesActivas[0].soporte_id);
      return `Asignada a ${soporte}`;
    }

    return `${asignacionesActivas.length} asignaciones activas`;
  }

  cargarUsuariosSoporte(): void {
    this.usuarioService.obtenerUsuariosPorRol('68ca68bb0bc4d9ca3267b665').subscribe({
      next: (usuarios: any[]) => {
        this.usuariosSoporte = usuarios;
      },
      error: () => {}
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.asignaciones];

    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(a => a.estado === this.filtroEstado);
    }

    if (this.filtroTexto.trim()) {
      const busqueda = this.filtroTexto.toLowerCase();
      resultado = resultado.filter(a => 
        a.observacion?.toLowerCase().includes(busqueda) ||
        this.obtenerNombreSoporte(a.soporte_id).toLowerCase().includes(busqueda)
      );
    }

    this.asignacionesFiltradas = resultado;
    this.totalAsignaciones = resultado.length;
    this.totalPages = Math.ceil(resultado.length / this.pageSize) || 1;
    if (this.page >= this.totalPages) {
      this.page = Math.max(0, this.totalPages - 1);
    }
    this.actualizarPagina();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  actualizarPagina(): void {
    const start = this.page * this.pageSize;
    this.asignacionesPaginadas = this.asignacionesFiltradas.slice(start, start + this.pageSize);
  }

  goToPage(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPages || pagina === this.page) return;
    this.page = pagina;
    this.actualizarPagina();
  }

  onPageSizeChange(size: any): void {
    const newSize = +size;
    if (!isNaN(newSize) && newSize > 0) {
      this.pageSize = newSize;
      this.page = 0;
      this.aplicarFiltros();
    }
  }

  trackByAsignacionId(index: number, asig: Asignacion): string {
    return asig.id || index.toString();
  }

  abrirModalNuevaAsignacion(): void {
    this.nuevaAsignacion = {
      quejaId: '',
      soporteId: '',
      observacion: ''
    };
    this.showModal = true;
  }

  abrirModalQuejas(): void {
    this.showQuejasModal = true;
  }

  abrirModalReasignar(asignacion: Asignacion): void {
    this.asignacionParaReasignar = asignacion;
    this.datosReasignacion = {
      nuevoSoporteId: '',
      motivo: ''
    };
    this.showReasignarModal = true;
  }

  asignarQueja(): void {
    if (!this.nuevaAsignacion.quejaId || !this.nuevaAsignacion.soporteId) {
      alert('Por favor selecciona una queja y un usuario de soporte');
      return;
    }

    const currentUser = this.usuarioService.getUser();
    if (!currentUser) {
      alert('No hay usuario autenticado');
      return;
    }

    this.loading = true;

    this.asignacionService.asignarQueja(
      this.nuevaAsignacion.quejaId,
      this.nuevaAsignacion.soporteId,
      (currentUser as any).id,
      this.nuevaAsignacion.observacion
    ).subscribe({
      next: (nuevaAsignacion) => {
        this.asignaciones.push(nuevaAsignacion);
        this.aplicarFiltros();
        this.verificarQuejasAsignadas();
        alert('Queja asignada correctamente');
        this.cerrarModal();
        setTimeout(() => {
          this.cargarDatos();
        }, 500);
        this.loading = false;
      },
      error: () => {
        alert('Error al asignar la queja');
        this.loading = false;
      }
    });
  }

  cambiarEstado(asignacion: Asignacion, nuevoEstado: string): void {
    if (!confirm(`Cambiar el estado a ${this.getEstadoTexto(nuevoEstado)}?`)) {
      return;
    }

    const currentUser = this.usuarioService.getUser();
    if (!currentUser) {
      alert('No hay usuario autenticado');
      return;
    }

    this.loading = true;

    this.asignacionService.cambiarEstadoAsignacion(
      asignacion.id,
      nuevoEstado,
      (currentUser as any).id
    ).subscribe({
      next: () => {
        alert('Estado actualizado correctamente');
        this.cargarDatos();
      },
      error: () => {
        alert('Error al cambiar el estado');
        this.loading = false;
      }
    });
  }

  confirmarReasignacion(): void {
    if (!this.datosReasignacion.nuevoSoporteId) {
      alert('Por favor selecciona un usuario de soporte');
      return;
    }

    if (!this.asignacionParaReasignar) {
      alert('No hay asignacion seleccionada');
      return;
    }

    const currentUser = this.usuarioService.getUser();
    if (!currentUser) {
      alert('No hay usuario autenticado');
      return;
    }

    this.loading = true;

    const motivo = this.datosReasignacion.motivo || 'Reasignacion administrativa';

    this.asignacionService.reasignarQueja(
      this.asignacionParaReasignar.id,
      this.datosReasignacion.nuevoSoporteId,
      (currentUser as any).id,
      motivo
    ).subscribe({
      next: () => {
        alert('Queja reasignada correctamente');
        this.cerrarModalReasignar();
        this.cargarDatos();
      },
      error: () => {
        alert('Error al reasignar la queja');
        this.loading = false;
      }
    });
  }

  asignarAutomaticamente(): void {
    const pendientes = this.quejasDisponibles.filter(q => !q.estaAsignada);

    if (pendientes.length === 0) {
      alert('No hay quejas pendientes por asignar');
      return;
    }

    if (this.usuariosSoporte.length === 0) {
      alert('No hay usuarios de soporte disponibles');
      return;
    }

    if (!confirm(`Asignar automaticamente ${pendientes.length} quejas entre ${this.usuariosSoporte.length} soportes?`)) {
      return;
    }

    const currentUser = this.usuarioService.getUser();
    if (!currentUser) {
      alert('No hay usuario autenticado');
      return;
    }

    this.asignandoAutomatico = true;
    this.loading = true;
    let completadas = 0;
    let fallos = 0;
    const total = pendientes.length;

    pendientes.forEach((queja, i) => {
      const soporte = this.usuariosSoporte[i % this.usuariosSoporte.length];

      this.asignacionService.asignarQueja(
        queja.id,
        soporte.id,
        (currentUser as any).id,
        'Asignacion automatica'
      ).subscribe({
        next: () => {
          completadas++;
          if (completadas + fallos === total) {
            this.asignandoAutomatico = false;
            this.cargarDatos();
            const msg = fallos > 0
              ? `Asignacion automatica completada: ${completadas} exitosas, ${fallos} fallos`
              : `${completadas} quejas asignadas correctamente`;
            alert(msg);
          }
        },
        error: () => {
          fallos++;
          if (completadas + fallos === total) {
            this.asignandoAutomatico = false;
            this.cargarDatos();
            alert(`Asignacion automatica completada: ${completadas} exitosas, ${fallos} fallos`);
          }
        }
      });
    });
  }

  verDetalleQueja(quejaId: string): void {
    window.open(`/public/feed/queja/${quejaId}`, '_blank');
  }

  cerrarModal(): void {
    this.showModal = false;
    this.asignacionSeleccionada = null;
  }

  cerrarModalQuejas(): void {
    this.showQuejasModal = false;
  }

  cerrarModalReasignar(): void {
    this.showReasignarModal = false;
    this.asignacionParaReasignar = null;
    this.datosReasignacion = {
      nuevoSoporteId: '',
      motivo: ''
    };
  }

  obtenerNombreSoporte(soporteId: string): string {
    const soporte = this.usuariosSoporte.find(u => u.id === soporteId);
    return soporte ? `${soporte.nombre} ${soporte.apellido}` : 'Cargando...';
  }

  getEstadoBadgeClass(estado: string): string {
    return this.asignacionService.getBadgeClass(estado);
  }

  getEstadoTexto(estado: string): string {
    return this.asignacionService.getEstadoTexto(estado);
  }

  onFiltroChange(): void {
    this.aplicarFiltros();
  }

  get totalPendientesAuto(): number {
    return this.quejasDisponibles.filter(q => !q.estaAsignada).length;
  }
}
