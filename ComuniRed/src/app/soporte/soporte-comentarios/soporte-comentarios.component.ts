import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ComentarioService } from '../../services/comentario.service';
import { UsuarioService } from '../../services/usuario.service';

interface ComentarioConContexto {
  id: string;
  texto: string;
  fecha_creacion: string;
  autor: {
    id: string;
    nombre: string;
    apellido: string;
    foto_perfil?: string;
  };
  queja: {
    id: string;
    titulo: string;
    descripcion: string;
    imagen_url?: string;
  };
  estado?: 'pendiente' | 'aprobado' | 'rechazado';
  showMenu?: boolean;
}

@Component({
  selector: 'app-soporte-comentario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './soporte-comentarios.component.html',
  styleUrls: ['./soporte-comentarios.component.css']
})
export class SoporteComentarioComponent implements OnInit {
  comentarios: ComentarioConContexto[] = [];
  comentariosFiltrados: ComentarioConContexto[] = [];
  loading = false;

  filtroTexto = '';
  filtroEstado: 'todos' | 'pendiente' | 'aprobado' | 'rechazado' = 'todos';
  filtroFecha: 'recientes' | 'antiguos' = 'recientes';

  totalComentarios = 0;

  showModalDetalle = false;
  comentarioSeleccionado: ComentarioConContexto | null = null;

  constructor(
    private comentarioService: ComentarioService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarComentarios();
  }

  cargarComentarios(): void {
    this.loading = true;

    this.comentarioService.obtenerTodosLosComentarios().subscribe({
      next: (comentarios: any[]) => {
        this.comentarios = comentarios.map(c => ({
          id: c.id,
          texto: c.texto,
          fecha_creacion: c.fecha_creacion,
          autor: {
            id: c.author?.id || '',
            nombre: c.author?.nombre || 'Anónimo',
            apellido: c.author?.apellido || '',
            foto_perfil: c.author?.foto_perfil
          },
          queja: {
            id: c.queja?.id || c.queja_id || '',
            titulo: c.queja?.titulo || 'Sin título',
            descripcion: c.queja?.descripcion || '',
            imagen_url: c.queja?.imagen_url
          },
          estado: 'aprobado',
          showMenu: false
        }));

        this.calcularEstadisticas();
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      }
    });
  }

  private calcularEstadisticas(): void {
    this.totalComentarios = this.comentarios.length;
  }

  aplicarFiltros(): void {
    let resultado = [...this.comentarios];

    if (this.filtroTexto.trim()) {
      const busqueda = this.filtroTexto.toLowerCase();
      resultado = resultado.filter(c =>
        c.texto.toLowerCase().includes(busqueda) ||
        c.autor.nombre.toLowerCase().includes(busqueda) ||
        c.autor.apellido.toLowerCase().includes(busqueda) ||
        c.queja.titulo.toLowerCase().includes(busqueda)
      );
    }

    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(c => c.estado === this.filtroEstado);
    }

    resultado.sort((a, b) => {
      const fechaA = new Date(a.fecha_creacion).getTime();
      const fechaB = new Date(b.fecha_creacion).getTime();
      return this.filtroFecha === 'recientes' ? fechaB - fechaA : fechaA - fechaB;
    });

    this.comentariosFiltrados = resultado;
  }

  eliminarComentario(comentario: ComentarioConContexto): void {
    if (!confirm(`¿Eliminar el comentario de ${comentario.autor.nombre}?`)) {
      return;
    }

    const soporteUser = this.usuarioService.getUser();
    if (!soporteUser) {
      alert('No hay usuario de soporte autenticado');
      return;
    }

    this.loading = true;

    this.comentarioService.eliminarComentario(comentario.id, (soporteUser as any).id).subscribe({
      next: () => {
        this.comentarios = this.comentarios.filter(c => c.id !== comentario.id);
        this.calcularEstadisticas();
        this.aplicarFiltros();
        this.loading = false;
        alert('Comentario eliminado correctamente');
      },
      error: (err) => {
        console.error('Error eliminando comentario:', err);
        this.loading = false;
        alert('Error al eliminar el comentario');
      }
    });
  }

  aprobarComentario(comentario: ComentarioConContexto): void {
    if (!confirm(`¿Aprobar el comentario de ${comentario.autor.nombre}?`)) {
      return;
    }

    const soporteUser = this.usuarioService.getUser();
    if (!soporteUser) {
      alert('No hay usuario de soporte autenticado');
      return;
    }

    this.loading = true;

    this.comentarioService.aprobarComentario(comentario.id, (soporteUser as any).id).subscribe({
      next: () => {
        comentario.estado = 'aprobado';
        this.calcularEstadisticas();
        this.aplicarFiltros();
        this.loading = false;
        alert('Comentario aprobado correctamente');
      },
      error: (err) => {
        console.error('Error aprobando comentario:', err);
        this.loading = false;
        alert('Error al aprobar el comentario');
      }
    });
  }

  rechazarComentario(comentario: ComentarioConContexto): void {
    const razon = prompt('Razón del rechazo (opcional):');
    
    if (razon === null) {
      return;
    }

    const soporteUser = this.usuarioService.getUser();
    if (!soporteUser) {
      alert('No hay usuario de soporte autenticado');
      return;
    }

    this.loading = true;

    this.comentarioService.rechazarComentario(
      comentario.id, 
      (soporteUser as any).id, 
      razon || 'Contenido inapropiado'
    ).subscribe({
      next: () => {
        comentario.estado = 'rechazado';
        this.aplicarFiltros();
        this.loading = false;
        alert('Comentario rechazado correctamente');
      },
      error: (err) => {
        console.error('Error rechazando comentario:', err);
        this.loading = false;
        alert('Error al rechazar el comentario');
      }
    });
  }

  verDetalle(comentario: ComentarioConContexto): void {
    this.comentarioSeleccionado = comentario;
    this.showModalDetalle = true;
  }

  cerrarModal(): void {
    this.showModalDetalle = false;
    this.comentarioSeleccionado = null;
  }

  getEstadoClass(estado?: string): string {
    switch (estado) {
      case 'aprobado': return 'estado-aprobado';
      case 'rechazado': return 'estado-rechazado';
      case 'pendiente': return 'estado-pendiente';
      default: return 'estado-default';
    }
  }

  onFiltroChange(): void {
    this.aplicarFiltros();
  }

  abrirImagenGrande(url: string): void {
    window.open(url, '_blank');
  }


  onImageError(event: Event): void {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.src = 'assets/img/default-avatar.png';
  }
}

onImageLoadError(event: Event): void {
  const target = event.target as HTMLElement;
  if (target) {
    target.style.display = 'none';
  }
}
}

