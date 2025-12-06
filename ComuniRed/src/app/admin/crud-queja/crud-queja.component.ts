import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { QuejaService } from '../../services/queja.service';
import { UsuarioService, Usuario } from '../../services/usuario.service';
import { EstadosQuejaService } from '../../services/estado-queja.service';
import { AsignacionService } from '../../services/asignacion.service'; // nuevo

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
  usuariosSoporte: Usuario[] = []; // lista filtrada de soportes
  estados: EstadoQueja[] = [];
  showModal = false;
  editingQueja: Queja | null = null;
  quejaData: Partial<Queja> = {};
  loading = false;

  // assignment form state
  selectedSoporteId?: string;
  comentariosAsignacion?: string;

  private ACTUALIZAR_QUEJA = gql`
    mutation ActualizarQueja($id: ID!, $imagen_url: String) {
      actualizarQueja(id: $id, imagen_url: $imagen_url) {
        id
        imagen_url
      }
    }
  `;

  // id del rol "soporte" (ajusta si cambia)
  private readonly SOPORTE_ROLE_ID = '68ca68bb0bc4d9ca3267b665';

  constructor(
    private apollo: Apollo,
    private quejaService: QuejaService,
    private usuarioService: UsuarioService,
    private estadosQuejaService: EstadosQuejaService,
    private asignacionService: AsignacionService
  ) {}

  ngOnInit(): void {
    this.loadUsuarios();
    this.loadEstados();
    this.loadQuejas();
  }

  loadQuejas(): void {
    this.loading = true;
    const usuarioActualId = ''; // ajusta si tu backend necesita un adminId
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
          categoria_nombre: q.categoria?.nombre || '',
          ubicacion: q.ubicacion || ''
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando quejas:', err);
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
          this.usuariosSoporte = users.filter((u: any) => u.rol_id === this.SOPORTE_ROLE_ID);
        },
        error: (err: any) => {
          console.error('Error cargando usuarios, fallback vacío', err);
          this.usuarios = [];
          this.usuariosSoporte = [];
        }
      });
    } else {
      this.usuarios = [];
      this.usuariosSoporte = [];
    }
  }

  loadEstados(): void {
    if (this.estadosQuejaService && typeof (this.estadosQuejaService as any).obtenerEstadosQueja === 'function') {
      (this.estadosQuejaService as any).obtenerEstadosQueja(0, 100).subscribe({
        next: (page: any) => {
          this.estados = (page?.content || []).map((e: any) => ({ id: e.id, nombre: e.nombre }));
        },
        error: (err: any) => {
          console.error('Error cargando estados, fallback vacío', err);
          this.estados = [];
        }
      });
    } else {
      this.estados = [];
    }
  }

  openAddModal(): void {
    this.editingQueja = null;
    this.quejaData = {};
    this.showModal = true;
    // reset assignment fields
    this.selectedSoporteId = undefined;
    this.comentariosAsignacion = undefined;
  }

  // Ahora abrimos modal en modo "asignación"
  openAssignModal(queja: Queja): void {
    this.editingQueja = { ...queja };
    this.quejaData = { ...queja };
    this.showModal = true;
    // preselect first soporte if available
    this.selectedSoporteId = this.usuariosSoporte.length ? this.usuariosSoporte[0].id : undefined;
    this.comentariosAsignacion = undefined;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingQueja = null;
    this.quejaData = {};
    this.selectedSoporteId = undefined;
    this.comentariosAsignacion = undefined;
  }

  // Crear/actualizar queja (modo creación)
  saveQueja(): void {
    if (!this.quejaData.descripcion || !this.quejaData.usuario_id || !this.quejaData.estado_id) {
      alert('Completa descripción, usuario y estado');
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
        '' // usuarioActualId para refetch si aplica
      ).subscribe({
        next: (updated) => {
          this.finalizeSave();
        },
        error: (err) => {
          console.error('Error actualizando queja:', err);
          this.loading = false;
        }
      });
    } else {
      this.quejaService.crearQueja(
        this.quejaData.titulo || '',
        this.quejaData.descripcion,
        this.quejaData.categoria_id || '',
        this.quejaData.usuario_id!,
        this.quejaData.ubicacion,
        undefined
      ).subscribe({
        next: (created) => {
          this.finalizeSave();
        },
        error: (err) => {
          console.error('Error creando queja:', err);
          this.loading = false;
        }
      });
    }
  }

  private finalizeSave(): void {
    this.loadQuejas();
    this.closeModal();
    this.loading = false;
  }

  deleteQueja(queja: Queja): void {
    if (!confirm(`¿Seguro que deseas eliminar la queja #${queja.id}?`)) return;
    this.loading = true;
    this.quejaService.eliminarQueja(queja.id, '').subscribe({
      next: (ok) => {
        if (ok) this.loadQuejas();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error eliminando queja:', err);
        this.loading = false;
      }
    });
  }

  // Assign flow
  onAssignToSupport(): void {
    if (!this.editingQueja || !this.selectedSoporteId) return;
    this.loading = true;
    // obtain current user id from usuarioService (if available)
    const currentUser = (this.usuarioService as any).getUser ? (this.usuarioService as any).getUser() : null;
    const asignadoPor = currentUser?.id || 'system';

    this.asignacionService.asignarQueja(this.editingQueja.id, this.selectedSoporteId, asignadoPor, this.comentariosAsignacion)
      .subscribe({
        next: (a) => {
          // refresh list and close
          this.loadQuejas();
          this.closeModal();
          this.loading = false;
          alert('Queja asignada correctamente');
        },
        error: (err) => {
          console.error('Error asignando queja:', err);
          this.loading = false;
          alert('Error al asignar la queja');
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
              id titulo descripcion ubicacion imagen_url usuario { id nombre apellido } estado { id nombre }
            }
          }`,
        variables: { usuarioActualId: '' }
      }]
    }).toPromise();
  }
}