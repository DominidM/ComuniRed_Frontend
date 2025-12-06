import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { QuejaService } from '../../services/queja.service';
import { UsuarioService, Usuario } from '../../services/usuario.service';
import { EstadosQuejaService } from '../../services/estado-queja.service'; // CORRECCIÓN: nombre exportado

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
  estados: EstadoQueja[] = [];
  showModal = false;
  editingQueja: Queja | null = null;
  quejaData: Partial<Queja> = {};
  loading = false;

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
    private estadosQuejaService: EstadosQuejaService // CORRECCIÓN: usa el servicio exportado
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
          categoria_nombre: q.categoria?.nombre || ''
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
    // usuarioService.obtenerUsuarios devuelve paginado; si tienes obtenerTodosLosUsuarios úsalo
    if (this.usuarioService && typeof (this.usuarioService as any).obtenerTodosLosUsuarios === 'function') {
      (this.usuarioService as any).obtenerTodosLosUsuarios().subscribe({
        next: (users: any) => this.usuarios = users,
        error: (err: any) => {
          console.error('Error cargando usuarios, fallback vacío', err);
          this.usuarios = [];
        }
      });
    } else {
      this.usuarios = [];
    }
  }

  loadEstados(): void {
    if (this.estadosQuejaService && typeof (this.estadosQuejaService as any).obtenerEstadosQueja === 'function') {
      // llamar con page,size (0,100) y mapear
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
          if (this.quejaData.imagen_url) {
            this.updateImagenUrl(updated.id, this.quejaData.imagen_url as string)
              .then(() => this.finalizeSave())
              .catch((err) => { console.error(err); this.finalizeSave(); });
          } else {
            this.finalizeSave();
          }
        },
        error: (err) => {
          console.error('Error actualizando queja:', err);
          this.loading = false;
        }
      });
    } else {
      const imagenUrl = this.quejaData.imagen_url ? this.quejaData.imagen_url : undefined;
      this.quejaService.crearQueja(
        this.quejaData.titulo || '',
        this.quejaData.descripcion,
        this.quejaData.categoria_id || '',
        this.quejaData.usuario_id!,
        this.quejaData.ubicacion,
        undefined
      ).subscribe({
        next: (created) => {
          if (imagenUrl) {
            this.updateImagenUrl(created.id, imagenUrl)
              .then(() => this.finalizeSave())
              .catch((err) => { console.error(err); this.finalizeSave(); });
          } else {
            this.finalizeSave();
          }
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