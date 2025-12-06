import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AsignacionService, Asignacion } from '../../services/asignacion.service';
import { QuejaService } from '../../services/queja.service';
import { UsuarioService } from '../../services/usuario.service';

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
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './crud-asignacion.component.html',
  styleUrls: ['./crud-asignacion.component.css']
})
export class CrudAsignacionComponent implements OnInit {
  asignaciones: Asignacion[] = [];
  asignacionesFiltradas: Asignacion[] = [];
  quejasDisponibles: QuejaParaAsignar[] = [];
  usuariosSoporte: UsuarioSoporte[] = [];
  
  loading = false;
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
      error: (err) => {
        console.error('Error cargando asignaciones:', err);
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
        console.log('✅ Quejas con +5 votos listas para asignar:', this.quejasDisponibles);
      },
      error: (err) => {
        console.error('Error cargando quejas:', err);
      }
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

    console.log('✅ Estado actualizado de quejas:', this.quejasDisponibles);
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
        console.log('✅ Usuarios de soporte cargados:', this.usuariosSoporte);
      },
      error: (err) => {
        console.error('Error cargando soportes:', err);
      }
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
        a.queja_id.toLowerCase().includes(busqueda) ||
        a.observacion?.toLowerCase().includes(busqueda)
      );
    }

    this.asignacionesFiltradas = resultado;
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
        console.log('✅ Queja asignada:', nuevaAsignacion);
        
        // ✅ Agregar la nueva asignación inmediatamente a la lista
        this.asignaciones.push(nuevaAsignacion);
        this.aplicarFiltros();
        this.verificarQuejasAsignadas();
        
        alert('✅ Queja asignada correctamente');
        this.cerrarModal();
        
        // ✅ Recargar datos para sincronizar con el servidor
        setTimeout(() => {
          this.cargarDatos();
        }, 500);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error asignando queja:', err);
        alert('Error al asignar la queja');
        this.loading = false;
      }
    });
  }

  cambiarEstado(asignacion: Asignacion, nuevoEstado: string): void {
    if (!confirm(`¿Cambiar el estado a ${this.getEstadoTexto(nuevoEstado)}?`)) {
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
        alert('✅ Estado actualizado correctamente');
        this.cargarDatos();
      },
      error: (err) => {
        console.error('❌ Error cambiando estado:', err);
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
      alert('No hay asignación seleccionada');
      return;
    }

    const currentUser = this.usuarioService.getUser();
    if (!currentUser) {
      alert('No hay usuario autenticado');
      return;
    }

    this.loading = true;

    const motivo = this.datosReasignacion.motivo || 'Reasignación administrativa';

    this.asignacionService.reasignarQueja(
      this.asignacionParaReasignar.id,
      this.datosReasignacion.nuevoSoporteId,
      (currentUser as any).id,
      motivo
    ).subscribe({
      next: () => {
        alert('✅ Queja reasignada correctamente');
        this.cerrarModalReasignar();
        this.cargarDatos();
      },
      error: (err) => {
        console.error('❌ Error reasignando queja:', err);
        alert('Error al reasignar la queja');
        this.loading = false;
      }
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
}
