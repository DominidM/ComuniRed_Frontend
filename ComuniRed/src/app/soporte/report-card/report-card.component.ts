import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reporte } from '../soporte.component';

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.css']
})
export class ReportCardComponent {
  @Input() reporte!: Reporte;

  mostrarDetalles = false;
  imagenSeleccionada: string | null = null; // Para ver imagen en grande

  abrirDetalles() {
    this.mostrarDetalles = true;
  }

  cerrarDetalles() {
    this.mostrarDetalles = false;
    this.imagenSeleccionada = null; // Cierra imagen si estaba abierta
  }

  abrirImagen(img: string) {
    this.imagenSeleccionada = img;
  }

  cerrarImagen() {
    this.imagenSeleccionada = null;
  }

  getEstadoClase(): string {
    switch (this.reporte.estado.toLowerCase()) {
      case 'pendiente':
        return 'estado-pendiente';
      case 'en progreso':
        return 'estado-progreso';
      case 'resuelto':
        return 'estado-resuelto';
      default:
        return 'estado-default';
    }
  }
}

export const REPORTES: Reporte[] = [
  {
    id: 1,
    usuario: 'Carlos Ruiz',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757493645/Poses-Perfil-Profesional-Hombresdic.-27-2022-3-819x1024_p76mzs.webp',
    categoria: 'Alumbrado',
    titulo: 'Foco roto en la esquina',
    descripcion: 'El poste de la esquina no tiene luz desde hace 3 días.',
    estado: 'pendiente',
    fecha: new Date('2025-09-01'),
    ubicacion: 'Av. Principal 123',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/poste-barrios-altos2_542958_twyi5f.jpg'],
    likes: 5,
    helpful: 3,
    comentarios: [{ autor: 'María', texto: 'Yo también lo vi', fecha: new Date('2025-09-02') }],
    historial: [{ accion: 'Reporte creado', autor: 'Carlos Ruiz', fecha: new Date('2025-09-01') }]
  },
  {
    id: 2,
    usuario: 'Lucía Fernández',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757493654/mujer-perfil-profesional_sljjkl.webp',
    categoria: 'Limpieza',
    titulo: 'Acumulación de basura en la esquina',
    descripcion: 'Varias bolsas de basura llevan más de 2 días sin ser recogidas.',
    estado: 'en progreso',
    fecha: new Date('2025-09-03'),
    ubicacion: 'Jr. Las Flores 456',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/basura_esquina_avx2lp.jpg'],
    likes: 8,
    helpful: 5,
    comentarios: [{ autor: 'Pedro', texto: 'Esto genera mal olor', fecha: new Date('2025-09-03') }],
    historial: [{ accion: 'Reporte creado', autor: 'Lucía Fernández', fecha: new Date('2025-09-03') }]
  },
  {
    id: 3,
    usuario: 'Andrés Gómez',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757493646/hombre-casual-empresa-820x1024_gyyt7s.webp',
    categoria: 'Seguridad',
    titulo: 'Robo en el parque',
    descripcion: 'Vecinos reportaron un robo anoche cerca del parque central.',
    estado: 'pendiente',
    fecha: new Date('2025-09-04'),
    ubicacion: 'Parque Central',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/parque_noche_mjdfsf.jpg'],
    likes: 12,
    helpful: 8,
    comentarios: [{ autor: 'Laura', texto: 'Debemos pedir más patrullaje', fecha: new Date('2025-09-04') }],
    historial: [{ accion: 'Reporte creado', autor: 'Andrés Gómez', fecha: new Date('2025-09-04') }]
  },
  {
    id: 4,
    usuario: 'María López',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757493652/mujer-empresa-rostro-819x1024_fjklpo.webp',
    categoria: 'Alumbrado',
    titulo: 'Farola parpadeando',
    descripcion: 'La farola frente a mi casa parpadea constantemente.',
    estado: 'resuelto',
    fecha: new Date('2025-08-28'),
    ubicacion: 'Calle Los Pinos 789',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/farola_parpadeando_xrj5vs.jpg'],
    likes: 3,
    helpful: 1,
    comentarios: [{ autor: 'Carlos', texto: 'Gracias por reportar', fecha: new Date('2025-08-29') }],
    historial: [
      { accion: 'Reporte creado', autor: 'María López', fecha: new Date('2025-08-28') },
      { accion: 'Problema resuelto', autor: 'Municipalidad', fecha: new Date('2025-08-30') }
    ]
  },
  {
    id: 5,
    usuario: 'Pedro Sánchez',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757493647/hombre-joven-perfil-empresa-819x1024_o3dskn.webp',
    categoria: 'Limpieza',
    titulo: 'Papelera rota',
    descripcion: 'La papelera del parque está rota y la basura se cae.',
    estado: 'pendiente',
    fecha: new Date('2025-09-05'),
    ubicacion: 'Parque Infantil',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/papelera_rota_jd92hy.jpg'],
    likes: 6,
    helpful: 2,
    comentarios: [{ autor: 'Ana', texto: 'Esto atrae animales', fecha: new Date('2025-09-05') }],
    historial: [{ accion: 'Reporte creado', autor: 'Pedro Sánchez', fecha: new Date('2025-09-05') }]
  },
  {
    id: 6,
    usuario: 'Valeria Torres',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757493653/mujer-negocios-perfil-819x1024_klj4nm.webp',
    categoria: 'Seguridad',
    titulo: 'Auto sospechoso estacionado',
    descripcion: 'Un auto sin placas lleva estacionado 2 días en la calle.',
    estado: 'en progreso',
    fecha: new Date('2025-09-06'),
    ubicacion: 'Av. El Sol 222',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/auto_sospechoso_zpql4h.jpg'],
    likes: 9,
    helpful: 4,
    comentarios: [{ autor: 'Luis', texto: 'Podría ser peligroso', fecha: new Date('2025-09-06') }],
    historial: [{ accion: 'Reporte creado', autor: 'Valeria Torres', fecha: new Date('2025-09-06') }]
  },
  {
    id: 7,
    usuario: 'Diego Ramos',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757493648/hombre-camisa-perfil-820x1024_jh7glk.webp',
    categoria: 'Alumbrado',
    titulo: 'Poste caído por accidente',
    descripcion: 'Un vehículo derribó el poste de alumbrado esta madrugada.',
    estado: 'pendiente',
    fecha: new Date('2025-09-07'),
    ubicacion: 'Av. Libertad 321',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/poste_caido_abc3sd.jpg'],
    likes: 15,
    helpful: 7,
    comentarios: [{ autor: 'Rosa', texto: 'Zona peligrosa sin luz', fecha: new Date('2025-09-07') }],
    historial: [{ accion: 'Reporte creado', autor: 'Diego Ramos', fecha: new Date('2025-09-07') }]
  },
  {
    id: 8,
    usuario: 'Ana Morales',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757493655/mujer-sonriente-empresa-820x1024_fy8gkj.webp',
    categoria: 'Limpieza',
    titulo: 'Graffiti en pared',
    descripcion: 'Nueva pinta en la pared del colegio.',
    estado: 'pendiente',
    fecha: new Date('2025-09-08'),
    ubicacion: 'Colegio Nacional 55',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/graffiti_colegio_vsz12n.jpg'],
    likes: 4,
    helpful: 2,
    comentarios: [{ autor: 'Sofía', texto: 'Deberían limpiarlo pronto', fecha: new Date('2025-09-08') }],
    historial: [{ accion: 'Reporte creado', autor: 'Ana Morales', fecha: new Date('2025-09-08') }]
  }
];
