import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { QuejaService } from '../../services/queja.service';
import { UsuarioService, Usuario } from '../../services/usuario.service';
import { EstadosQuejaService } from '../../services/estado-queja.service';

interface Queja {
  id: string;
  titulo?: string;
  descripcion: string;
  fecha_creacion: string;
  usuario_id: string;
  usuario_nombre?: string;
  estado_id?: string;
  estado_nombre?: string;
  imagen_url?: string;
  categoria_id?: string;
  categoria_nombre?: string;
  ubicacion?: string;
}

interface EstadoQueja {
  id: string;
  nombre: string;
  clave?: string;
}

@Component({
  selector: 'app-crud-queja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-queja.component.html',
  styleUrls: ['./crud-queja.component.css']
})
export class CrudQuejaComponent implements OnInit {
  quejas: Queja[] = [];
  usuarios: Usuario[] = [];
  estados: EstadoQueja[] = [];
  showModal = false;
  editingQueja: Queja | null = null;
  quejaData: Partial<Queja> = {};
  loading = false;

  showModalCambioEstado = false;
  quejaSeleccionada: Queja | null = null;
  nuevoEstadoId: string = '';
  nuevoEstadoNombre: string = '';
  observacionEstado: string = '';

  private ACTUALIZAR_QUEJA = gql`
    mutation ActualizarQueja($id: ID!, $imagen_url: String) {
      actualizarQueja(id: $id, imagen_url: $imagen_url) {
        id
        imagen_url
      }
    }
  `;

  constructor(
    private apollo: Apollo,
    private quejaService: QuejaService,
    private usuarioService: UsuarioService,
    private estadosQuejaService: EstadosQuejaService
  ) {}

  ngOnInit(): void {
    this.loadEstados();
    this.loadUsuarios();
    this.loadQuejas();
  }

  loadQuejas(): void {
    this.loading = true;
    const adminUser = this.usuarioService.getUser();
    const usuarioActualId = adminUser ? (adminUser as any).id : '';

    this.quejaService.obtenerQuejas(usuarioActualId).subscribe({
      next: (data) => {
        this.quejas = (data || []).map((q: any) => ({
          id: q.id,
          titulo: q.titulo || '',
          descripcion: q.descripcion,
          fecha_creacion: q.fecha_creacion,
          usuario_id: q.usuario?.id || '',
          usuario_nombre: `${q.usuario?.nombre || ''} ${q.usuario?.apellido || ''}`.trim(),
          estado_id: q.estado?.id || '',
          estado_nombre: q.estado?.nombre || '',
          imagen_url: q.imagen_url || '',
          categoria_id: q.categoria?.id || '',
          categoria_nombre: q.categoria?.nombre || ''
        }));
        this.loading = false;
        console.log('✅ Quejas cargadas:', this.quejas.length);
        console.log('📊 Primera queja:', this.quejas[0]);
      },
      error: (err) => {
        console.error('❌ Error cargando quejas:', err);
        this.loading = false;
        this.quejas = [];
      }
    });
  }

  loadUsuarios(): void {
    if (this.usuarioService && typeof (this.usuarioService as any).obtenerTodosLosUsuarios === 'function') {
      (this.usuarioService as any).obtenerTodosLosUsuarios().subscribe({
        next: (users: any) => {
          this.usuarios = users;
          console.log('✅ Usuarios cargados:', this.usuarios.length);
        },
        error: (err: any) => {
          console.error('❌ Error cargando usuarios:', err);
          this.usuarios = [];
        }
      });
    } else {
      console.warn('⚠️ obtenerTodosLosUsuarios no disponible');
      this.usuarios = [];
    }
  }

  loadEstados(): void {
    if (this.estadosQuejaService && typeof (this.estadosQuejaService as any).obtenerEstadosQueja === 'function') {
      (this.estadosQuejaService as any).obtenerEstadosQueja(0, 100).subscribe({
        next: (page: any) => {
          this.estados = (page?.content || []).map((e: any) => ({
            id: e.id,
            nombre: e.nombre,
            clave: e.clave
          }));
          console.log('✅ Estados cargados:', this.estados);
          
          if (this.estados.length === 0) {
            console.warn('⚠️ No hay estados disponibles en el backend');
          }
        },
        error: (err: any) => {
          console.error('❌ Error cargando estados:', err);
          this.estados = [];
        }
      });
    } else {
      console.error('❌ EstadosQuejaService.obtenerEstadosQueja no disponible');
      this.estados = [];
    }
  }

  // ✅ Este método ya no se usa si mostramos todos los estados
  getEstadosDisponibles(queja: Queja): EstadoQueja[] {
    return this.estados.filter(e => e.id !== queja.estado_id);
  }

  iniciarCambioEstado(queja: Queja, event: any): void {
    const nuevoEstadoId = event.target.value;

    console.log('🔍 Cambio detectado:', {
      quejaId: queja.id,
      estadoActual: queja.estado_id,
      nuevoEstado: nuevoEstadoId
    });

    // Si no hay valor seleccionado, salir
    if (!nuevoEstadoId || nuevoEstadoId === '') {
      return;
    }

    // Si seleccionó el mismo estado, no hacer nada
    if (nuevoEstadoId === queja.estado_id) {
      console.log('⚠️ Mismo estado seleccionado, no se abre modal');
      return;
    }

    const estadoEncontrado = this.estados.find(e => e.id === nuevoEstadoId);

    if (!estadoEncontrado) {
      console.error('❌ Estado no encontrado:', nuevoEstadoId);
      return;
    }

    this.quejaSeleccionada = queja;
    this.nuevoEstadoId = nuevoEstadoId;
    this.nuevoEstadoNombre = estadoEncontrado.nombre;
    this.observacionEstado = '';
    this.showModalCambioEstado = true;

    console.log('✅ Modal abierto para cambiar estado');
  }

  confirmarCambioEstado(): void {
    if (!this.quejaSeleccionada || !this.nuevoEstadoId) {
      console.error('❌ Datos incompletos para cambiar estado');
      return;
    }

    const adminUser = this.usuarioService.getUser();
    if (!adminUser) {
      alert('No hay usuario admin autenticado');
      return;
    }

    this.loading = true;

    const estadoEncontrado = this.estados.find(e => e.id === this.nuevoEstadoId);
    const claveEstado = estadoEncontrado?.clave || estadoEncontrado?.nombre || this.nuevoEstadoId;

    console.log('🔄 Enviando cambio de estado al backend:', {
      quejaId: this.quejaSeleccionada.id,
      usuarioId: (adminUser as any).id,
      estadoActual: this.quejaSeleccionada.estado_nombre,
      nuevoEstado: this.nuevoEstadoNombre,
      claveEstado: claveEstado,
      observacion: this.observacionEstado
    });

    this.quejaService.cambiarEstadoQueja(
      this.quejaSeleccionada.id,
      (adminUser as any).id,
      claveEstado,
      this.observacionEstado || undefined
    ).subscribe({
      next: (quejaActualizada) => {
        console.log('✅ Estado cambiado exitosamente en backend:', quejaActualizada);

        // Actualizar en la lista local
        const index = this.quejas.findIndex(q => q.id === quejaActualizada.id);
        if (index !== -1) {
          this.quejas[index] = {
            ...this.quejas[index],
            estado_id: quejaActualizada.estado?.id || '',
            estado_nombre: quejaActualizada.estado?.nombre || ''
          };
          console.log('✅ Queja actualizada en la lista local');
        }

        this.loading = false;
        this.cerrarModalEstado();
        alert(`✅ Estado cambiado a: ${quejaActualizada.estado?.nombre}`);
      },
      error: (err) => {
        console.error('❌ Error cambiando estado:', err);
        console.error('Detalles:', {
          message: err.message,
          graphQLErrors: err.graphQLErrors,
          networkError: err.networkError
        });
        this.loading = false;
        
        let errorMsg = 'Error al cambiar el estado.';
        if (err.graphQLErrors && err.graphQLErrors.length > 0) {
          errorMsg = err.graphQLErrors[0].message;
        }
        
        alert(`❌ ${errorMsg}`);
      }
    });
  }

  cerrarModalEstado(): void {
    this.showModalCambioEstado = false;
    this.quejaSeleccionada = null;
    this.nuevoEstadoId = '';
    this.nuevoEstadoNombre = '';
    this.observacionEstado = '';
    
    // Recargar quejas para asegurar que el estado se refleja correctamente
    this.loadQuejas();
  }

  getEstadoClass(estadoNombre?: string): string {
    if (!estadoNombre) return 'estado-default';

    const nombre = estadoNombre.toLowerCase();

    if (nombre.includes('pendiente')) return 'estado-pendiente';
    if (nombre.includes('aprobado') || nombre.includes('espera')) return 'estado-aprobado';
    if (nombre.includes('votación') || nombre.includes('votacion')) return 'estado-votacion';
    if (nombre.includes('proceso')) return 'estado-proceso';
    if (nombre.includes('resuel')) return 'estado-resuelto';
    if (nombre.includes('rechaz')) return 'estado-rechazado';

    return 'estado-default';
  }

  openEditModal(queja: Queja): void {
    this.editingQueja = { ...queja };
    this.quejaData = { ...queja };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingQueja = null;
    this.quejaData = {};
  }

  saveQueja(): void {
    if (!this.quejaData.descripcion || !this.quejaData.usuario_id || !this.quejaData.estado_id) {
      alert('Por favor completa: descripción, usuario y estado');
      return;
    }

    this.loading = true;

    if (this.editingQueja) {
      this.quejaService.actualizarQueja(
        this.editingQueja.id,
        this.quejaData.titulo,
        this.quejaData.descripcion,
        this.quejaData.categoria_id,
        this.quejaData.estado_id,
        this.quejaData.ubicacion,
        ''
      ).subscribe({
        next: (updated) => {
          if (this.quejaData.imagen_url) {
            this.updateImagenUrl(updated.id, this.quejaData.imagen_url as string)
              .then(() => this.finalizeSave())
              .catch((err) => { 
                console.error('Error actualizando imagen:', err); 
                this.finalizeSave(); 
              });
          } else {
            this.finalizeSave();
          }
        },
        error: (err) => {
          console.error('Error actualizando queja:', err);
          this.loading = false;
          alert('Error al actualizar la queja');
        }
      });
    }
  }

  private finalizeSave(): void {
    this.loadQuejas();
    this.closeModal();
    this.loading = false;
    alert('✅ Queja actualizada correctamente');
  }

  deleteQueja(queja: Queja): void {
    if (!confirm(`¿Estás seguro de eliminar la queja "${queja.titulo || queja.descripcion.substring(0, 30)}"?`)) {
      return;
    }

    this.loading = true;
    
    this.quejaService.eliminarQueja(queja.id, '').subscribe({
      next: (ok) => {
        if (ok) {
          console.log('✅ Queja eliminada:', queja.id);
          this.loadQuejas();
          alert('✅ Queja eliminada correctamente');
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error eliminando queja:', err);
        this.loading = false;
        alert('Error al eliminar la queja');
      }
    });
  }

  private updateImagenUrl(id: string, imagenUrl: string): Promise<any> {
    return this.apollo.mutate({
      mutation: this.ACTUALIZAR_QUEJA,
      variables: { id, imagen_url: imagenUrl },
      refetchQueries: [{
        query: gql`
          query ObtenerQuejas($usuarioActualId: ID!) {
            obtenerQuejas(usuarioActualId: $usuarioActualId) {
              id 
              titulo 
              descripcion 
              ubicacion 
              imagen_url 
              usuario { 
                id 
                nombre 
                apellido 
              } 
              estado { 
                id 
                nombre 
              }
            }
          }`,
        variables: { usuarioActualId: '' }
      }]
    }).toPromise();
  }
}
