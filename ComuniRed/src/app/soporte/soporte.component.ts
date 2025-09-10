import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-soporte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.css']
})
export class SoporteComponent {
  soporte = {
    nombre: 'Juan Carlos',
    rol: 'Soporte',
    avatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757493645/Poses-Perfil-Profesional-Hombresdic.-27-2022-3-819x1024_p76mzs.webp'
  };

  busqueda = '';
  estadoSeleccionado = '';
  imagenAmpliada: string | null = null;
  nuevoComentario = '';

  reportes = [
    {
      id: 1,
      usuario: 'Carlos Ruiz',
      usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757493578/images_lxxuza.jpg',
      categoria: 'Alumbrado',
      titulo: 'Foco roto en la esquina',
      descripcion: 'El poste de la esquina no tiene luz desde hace 3 días.',
      estado: 'pendiente',
      fecha: new Date(),
      ubicacion: 'Av. Principal 123',
      imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/poste-barrios-altos2_542958_twyi5f.jpg', 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/poste-barrios-altos2_542958_twyi5f.jpg'],
      likes: 2,
      helpful: 1,
      comentarios: [
        { autor: 'Soporte', texto: 'Estamos revisando este caso.', fecha: new Date() }
      ],
      historial: [{ accion: 'Reporte creado', autor: 'Carlos', fecha: new Date() }]
    },
    {
      id: 2,
      usuario: 'María Torres',
      usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491885/Perfil-Profesional-_280_1-819x1024_o7hvjh.webp',
      categoria: 'Basura',
      titulo: 'Contenedor lleno',
      descripcion: 'El contenedor de basura está desbordando.',
      estado: 'en-progreso',
      fecha: new Date(),
      ubicacion: 'Parque Central',
      imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/poste-barrios-altos2_542958_twyi5f.jpg'],
      likes: 5,
      helpful: 3,
      comentarios: [],
      historial: [{ accion: 'En revisión', autor: 'Soporte', fecha: new Date() }]
    },
    {
    id: 3,
    usuario: 'Juan Pérez',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491885/user2_xk2w4w.jpg',
    categoria: 'Seguridad',
    titulo: 'Robo en la tienda',
    descripcion: 'Se reportó un robo en la tienda de la esquina la noche anterior.',
    estado: 'pendiente',
    fecha: new Date(),
    ubicacion: 'Calle 10 #45',
    imagenes: [
      'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/robo-tienda.jpg'
    ],
    likes: 1,
    helpful: 0,
    comentarios: [],
    historial: [
      { accion: 'Reporte creado', autor: 'Juan Pérez', fecha: new Date() }
    ]
  },
  {
    id: 4,
    usuario: 'Ana Gómez',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491885/user3_q0ml85.jpg',
    categoria: 'Agua',
    titulo: 'Fuga de agua',
    descripcion: 'Hay una fuga de agua en el parque central cerca de los juegos.',
    estado: 'en-progreso',
    fecha: new Date(),
    ubicacion: 'Parque Central',
    imagenes: [
      'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/fuga-agua.jpg'
    ],
    likes: 3,
    helpful: 2,
    comentarios: [
      { autor: 'Soporte', texto: 'Ya enviamos a mantenimiento.', fecha: new Date() }
    ],
    historial: [
      { accion: 'En revisión', autor: 'Soporte', fecha: new Date() }
    ]
  },
  {
    id: 5,
    usuario: 'Luis Fernández',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491885/user4_dso9ki.jpg',
    categoria: 'Transporte',
    titulo: 'Semáforo descompuesto',
    descripcion: 'El semáforo en Av. Libertad no funciona desde ayer.',
    estado: 'pendiente',
    fecha: new Date(),
    ubicacion: 'Av. Libertad y Calle 6',
    imagenes: [
      'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/semaforo-falla.jpg'
    ],
    likes: 0,
    helpful: 1,
    comentarios: [],
    historial: [
      { accion: 'Reporte creado', autor: 'Luis Fernández', fecha: new Date() }
    ]
  },
  {
    id: 6,
    usuario: 'Paola Méndez',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491885/user5_xk7c3t.jpg',
    categoria: 'Basura',
    titulo: 'Basurero roto',
    descripcion: 'El basurero del parque está roto y la basura se cae.',
    estado: 'resuelto',
    fecha: new Date(),
    ubicacion: 'Parque del Sol',
    imagenes: [
      'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/basurero-roto.jpg'
    ],
    likes: 4,
    helpful: 2,
    comentarios: [
      { autor: 'Soporte', texto: 'Ya fue reemplazado el basurero.', fecha: new Date() }
    ],
    historial: [
      { accion: 'Resuelto', autor: 'Soporte', fecha: new Date() }
    ]
  },
  {
    id: 7,
    usuario: 'Jorge Castillo',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491885/user6_t16lty.jpg',
    categoria: 'Seguridad',
    titulo: 'Vidrios rotos en la vereda',
    descripcion: 'Hay vidrios rotos en la vereda, representa un peligro para los niños.',
    estado: 'pendiente',
    fecha: new Date(),
    ubicacion: 'Calle 12 y Av. Central',
    imagenes: [
      'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/vidrios-vereda.jpg'
    ],
    likes: 3,
    helpful: 1,
    comentarios: [],
    historial: [
      { accion: 'Reporte creado', autor: 'Jorge Castillo', fecha: new Date() }
    ]
  },
  {
    id: 8,
    usuario: 'Lucía Herrera',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491885/user7_d3qzqk.jpg',
    categoria: 'Agua',
    titulo: 'Corte de agua inesperado',
    descripcion: 'No hay agua desde esta mañana en la zona.',
    estado: 'en-progreso',
    fecha: new Date(),
    ubicacion: 'Barrio Las Flores',
    imagenes: [
      'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/corte-agua.jpg'
    ],
    likes: 2,
    helpful: 2,
    comentarios: [],
    historial: [
      { accion: 'En revisión', autor: 'Soporte', fecha: new Date() }
    ]
  }
  ];

  reportesFiltrados = [...this.reportes];
  reporteSeleccionado: any = null;

  get totalReportes() {
    return this.reportes.length;
  }
  get totalPendientes() {
    return this.reportes.filter(r => r.estado === 'pendiente').length;
  }
  get totalEnProgreso() {
    return this.reportes.filter(r => r.estado === 'en-progreso').length;
  }
  get totalResueltos() {
    return this.reportes.filter(r => r.estado === 'resuelto').length;
  }

  filtrarReportes() {
    // Filtro combinado: búsqueda, estado y urgencia.
    this.reportesFiltrados = this.reportes.filter(r => {
      const coincideBusqueda =
        r.usuario.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        r.categoria.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        r.descripcion.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideEstado = this.estadoSeleccionado
        ? r.estado === this.estadoSeleccionado
        : true;
      return coincideBusqueda && coincideEstado;
    });
  }

  ordenarPor(criterio: string) {
    if (criterio === 'reciente') {
      this.reportesFiltrados.sort((a, b) => +b.fecha - +a.fecha);
    } else if (criterio === 'votos') {
      this.reportesFiltrados.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
  }

  mostrarSoloUrgentes() {
    // Respeta búsqueda y filtros activos, pero filtra solo por pendientes
    this.reportesFiltrados = this.reportes.filter(r => {
      const coincideBusqueda =
        r.usuario.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        r.categoria.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        r.descripcion.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideEstado = r.estado === 'pendiente';
      return coincideBusqueda && coincideEstado;
    });
  }

  getEstadoClase(estado: string) {
    switch (estado) {
      case 'pendiente': return 'badge badge-pendiente';
      case 'en-progreso': return 'badge badge-progreso';
      case 'resuelto': return 'badge badge-resuelto';
      default: return 'badge';
    }
  }

  verDetalle(reporte: any) {
    this.reporteSeleccionado = reporte;
    this.nuevoComentario = '';
  }

  asignarAmi(reporte: any) {
    if (reporte.estado !== 'en-progreso') {
      reporte.estado = 'en-progreso';
      reporte.historial.push({
        accion: 'Asignado a ' + this.soporte.nombre,
        autor: this.soporte.nombre,
        fecha: new Date()
      });
      this.filtrarReportes();
    }
  }

  marcarResuelto(reporte: any) {
    if (reporte.estado !== 'resuelto') {
      reporte.estado = 'resuelto';
      reporte.historial.push({
        accion: 'Marcado como resuelto',
        autor: this.soporte.nombre,
        fecha: new Date()
      });
      this.filtrarReportes();
    }
  }

  reaccionar(reporte: any, tipo: string, event: Event) {
    event.stopPropagation();
    if (tipo === 'like') reporte.likes = (reporte.likes || 0) + 1;
    if (tipo === 'helpful') reporte.helpful = (reporte.helpful || 0) + 1;
  }

  compartir(reporte: any, event: Event) {
    event.stopPropagation();
    alert(`Enlace copiado: /reportes/${reporte.id}`);
  }

  agregarComentario() {
    if (
      !this.nuevoComentario.trim() ||
      !this.reporteSeleccionado ||
      !Array.isArray(this.reporteSeleccionado.comentarios)
    ) return;
    this.reporteSeleccionado.comentarios.push({
      autor: this.soporte.nombre,
      texto: this.nuevoComentario,
      fecha: new Date()
    });
    this.nuevoComentario = '';
  }

  bloquearUsuario(usuario: string, event: Event) {
    event.stopPropagation();
    if (confirm(`¿Bloquear a ${usuario}?`)) {
      alert(`${usuario} ha sido bloqueado.`);
      this.reportes = this.reportes.filter(r => r.usuario !== usuario);
      this.filtrarReportes();
      // Si el usuario bloqueado era el seleccionado, cierra el modal
      if (this.reporteSeleccionado && this.reporteSeleccionado.usuario === usuario) {
        this.reporteSeleccionado = null;
      }
    }
  }

  exportarReporte(reporte: any) {
    alert(`Generando PDF del reporte #${reporte.id}`);
  }

  irConfiguracion() {
    alert('Abriendo configuración de soporte...');
  }
  cerrarSesion() {
    alert('Sesión cerrada.');
  }

  ampliarImagen(img: string, event: Event) {
    event.stopPropagation();
    this.imagenAmpliada = img;
  }

  cerrarImagenAmpliada(event: Event) {
    event.stopPropagation();
    this.imagenAmpliada = null;
  }
}