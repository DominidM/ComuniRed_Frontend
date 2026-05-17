import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  QuejaService,
  Queja,
  HistorialEvento,
} from '../../../services/queja.service';
import { UsuarioService } from '../../../services/usuario.service';
import { EstadosQuejaService } from '../../../services/estado-queja.service';
import { LoadingOverlayComponent } from '../../../shared/components/loading/loading.component';
import { WorkspaceHeaderComponent } from '../../../shared/components/workspace-header/workspace-header.component';

interface EstadoQueja {
  id: string;
  nombre: string;
  clave?: string;
}

type Tab =
  | 'info'
  | 'editar'
  | 'estado'
  | 'evidencias'
  | 'comentarios'
  | 'historial';

@Component({
  selector: 'app-detalle-queja',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingOverlayComponent,
    WorkspaceHeaderComponent,
  ],
  templateUrl: './detalle-queja.component.html',
  styleUrls: ['./detalle-queja.component.css'],
})
export class DetalleQuejaComponent implements OnInit {
  queja: Queja | null = null;
  historial: HistorialEvento[] = [];
  estados: EstadoQueja[] = [];

  loading = false;
  loadingHistorial = false;
  savingEdit = false;
  savingEstado = false;

  activeTab: Tab = 'info';

  editData = {
    titulo: '',
    descripcion: '',
    ubicacion: '',
    imagen_url: '',
  };

  nuevoEstadoId = '';
  nuevoEstadoClave = '';
  observacionEstado = '';

  private quejaId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quejaService: QuejaService,
    private usuarioService: UsuarioService,
    private estadosQuejaService: EstadosQuejaService,
  ) {}

  ngOnInit(): void {
    this.quejaId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.quejaId) {
      this.router.navigate(['/admin/queja']);
      return;
    }

    this.loadEstados();
    this.loadQueja();
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;

    if (tab === 'historial' && this.historial.length === 0) {
      this.loadHistorial();
    }
  }

  loadQueja(): void {
    this.loading = true;

    const user = this.usuarioService.getUser();
    const userId = user ? (user as any).id : '';

    this.quejaService.obtenerQuejaPorId(this.quejaId, userId).subscribe({
      next: (q: Queja | null) => {
        if (!q) {
          console.warn('No se encontró la queja con id:', this.quejaId);
          this.queja = null;
          this.loading = false;
          this.router.navigate(['/admin/queja']);
          return;
        }

        this.queja = q;
        this.resetEditData(q);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando queja:', err);
        this.queja = null;
        this.loading = false;
      },
    });
  }

  loadEstados(): void {
    this.estadosQuejaService.obtenerEstadosQueja(0, 100).subscribe({
      next: (page: any) => {
        this.estados = (page?.content || []).map((e: any) => ({
          id: e.id,
          nombre: e.nombre,
          clave: e.clave,
        }));
      },
      error: () => {
        this.estados = [];
      },
    });
  }

  loadHistorial(): void {
    this.loadingHistorial = true;

    this.quejaService.obtenerHistorialPorQueja(this.quejaId).subscribe({
      next: (h) => {
        this.historial = h;
        this.loadingHistorial = false;
      },
      error: () => {
        this.loadingHistorial = false;
      },
    });
  }

  private resetEditData(q: Queja | null | undefined): void {
    this.editData = {
      titulo: q?.titulo || '',
      descripcion: q?.descripcion || '',
      ubicacion: q?.ubicacion || '',
      imagen_url: q?.imagen_url || '',
    };
  }

  saveEdit(): void {
    if (!this.editData.descripcion.trim()) {
      alert('La descripción es obligatoria');
      return;
    }

    this.savingEdit = true;

    const body = {
      titulo: this.editData.titulo,
      descripcion: this.editData.descripcion,
      ubicacion: this.editData.ubicacion,
      imagenUrl: this.editData.imagen_url,
    };

    fetch(`http://localhost:8080/api/quejas/${this.quejaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error HTTP: ' + res.status);
        return res.json();
      })
      .then(() => {
        this.savingEdit = false;
        alert('Queja actualizada correctamente');
        this.loadQueja();
        this.setTab('info');
      })
      .catch((err) => {
        this.savingEdit = false;
        alert('Error al guardar: ' + err.message);
      });
  }

  cancelEdit(): void {
    if (this.queja) {
      this.resetEditData(this.queja);
    }
    this.setTab('info');
  }

  onEstadoSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const estadoId = target.value;
    const encontrado = this.estados.find((e) => e.id === estadoId);

    this.nuevoEstadoId = estadoId;
    this.nuevoEstadoClave = encontrado?.clave || '';
  }

  saveEstado(): void {
    if (!this.nuevoEstadoId || !this.nuevoEstadoClave) {
      alert('Selecciona un estado');
      return;
    }

    if (this.nuevoEstadoId === this.queja?.estado?.id) {
      alert('El estado seleccionado es el mismo que el actual');
      return;
    }

    const user = this.usuarioService.getUser();
    if (!user) {
      alert('No hay usuario autenticado');
      return;
    }

    this.savingEstado = true;

    this.quejaService
      .cambiarEstadoQueja(
        this.quejaId,
        (user as any).id,
        this.nuevoEstadoClave,
        this.observacionEstado || undefined,
      )
      .subscribe({
        next: (quejaActualizada) => {
          if (this.queja) {
            this.queja = {
              ...this.queja,
              estado: quejaActualizada.estado,
            };
          }

          this.savingEstado = false;
          this.nuevoEstadoId = '';
          this.nuevoEstadoClave = '';
          this.observacionEstado = '';

          alert(`Estado cambiado a: ${quejaActualizada.estado?.nombre}`);
          this.setTab('info');
        },
        error: (err) => {
          this.savingEstado = false;
          const msg =
            err?.graphQLErrors?.[0]?.message || 'Error al cambiar estado';
          alert(msg);
        },
      });
  }

  volver(): void {
    this.router.navigate(['/admin/queja']);
  }

  getEstadoClass(clave?: string): string {
    if (!clave) return 'estado-default';
    const c = clave.toLowerCase();
    if (c.includes('pendiente')) return 'estado-pendiente';
    if (c.includes('aprobado') || c.includes('espera')) return 'estado-aprobado';
    if (c.includes('votaci')) return 'estado-votacion';
    if (c.includes('proceso')) return 'estado-proceso';
    if (c.includes('resuel')) return 'estado-resuelto';
    if (c.includes('rechaz')) return 'estado-rechazado';
    return 'estado-default';
  }

  getRiesgoClass(nivel?: string): string {
    if (!nivel) return 'riesgo-default';
    const n = nivel.toLowerCase();
    if (n === 'alto') return 'riesgo-alto';
    if (n === 'medio') return 'riesgo-medio';
    if (n === 'bajo') return 'riesgo-bajo';
    return 'riesgo-default';
  }

  getTipoEvidenciaIcon(tipo: string): string {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('video')) return '🎥';
    if (t.includes('audio')) return '🎵';
    if (t.includes('pdf')) return '📄';
    return '🖼️';
  }
}