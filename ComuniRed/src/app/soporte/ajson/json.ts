export interface Reacciones {
  likes: number;
  dislikes?: number;   // 👎 agregado
  reportes?: number;   // ⚠️ agregado
  helpful?: number;
  love?: number;
  wow?: number;
  sad?: number;
}

export interface Usuario {
  nombre: string;
  avatar: string;
}

export interface Comentario {
  autor: string;
  texto: string;
  fecha: Date;
}

export interface Historial {
  accion: string;
  autor: string;
  fecha: Date;
}

export interface Reporte {
  id: number;
  usuario: string;
  usuarioAvatar: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  estado: 'pendiente' | 'en progreso' | 'resuelto';
  prioridad: 'Alta' | 'Media' | 'Baja';
  periodo: string;
  fecha: Date;
  ubicacion: string;

  lat?: number;
  lng?: number;

  /** Imagen destacada para la card */
  imagenPrincipal?: string; // 🔥 agregado

  /** Galería de imágenes adicionales */
  imagenes: string[];

  reacciones: Reacciones;
  comentarios: Comentario[];
  historial: Historial[];
}

export const USUARIO_ACTUAL: Usuario = {
  nombre: 'Carlos Ruiz',
  avatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757493645/Poses-Perfil-Profesional-Hombresdic.-27-2022-3-819x1024_p76mzs.webp'
};

export const REPORTES: Reporte[] = [
  {
    id: 1,
    usuario: 'Maria Alvarez',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491885/Perfil-Profesional-_280_1-819x1024_o7hvjh.webp',
    categoria: 'Alumbrado',
    tipo: 'Infraestructura',
    periodo: 'Esta semana',
    titulo: 'Poste en mal estado',
    descripcion: 'El poste de la esquina no tiene luz desde hace 3 días.',
    estado: 'pendiente',
    prioridad: 'Alta',
    fecha: new Date('2025-09-01'),
    ubicacion: 'Av. Arequipa 123, Miraflores, Lima',
    lat: undefined,
    lng: undefined,
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/poste-barrios-altos2_542958_twyi5f.jpg'],
    reacciones: { likes: 5, dislikes: 2, helpful: 3, love: 0, wow: 5, sad: 0, reportes: 3 },
    comentarios: [{ autor: 'María', texto: 'Yo también lo vi', fecha: new Date('2025-09-02') }],
    historial: [{ accion: 'Reporte creado', autor: 'Carlos Ruiz', fecha: new Date('2025-09-01') }]
  },
  {
    id: 2,
    usuario: 'Mario Gutierrez',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757493578/images_lxxuza.jpg',
    categoria: 'Limpieza',
    tipo: 'Ambiental',
    periodo: 'Hoy',
    titulo: 'Basura acumulada',
    descripcion: 'Varias bolsas de basura llevan más de 2 días sin ser recogidas.',
    estado: 'en progreso',
    fecha: new Date('2025-09-03'),
    prioridad: 'Media',
    ubicacion: 'Jr. Cusco 456, Cercado de Lima, Lima',
    lat: undefined,
    lng: undefined,
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757787551/a09ffa08-24fb-4593-9c48-0183b0fee4bf_bwj8fs.jpg'],
    reacciones: { likes: 5, dislikes: 0, helpful: 3, love: 0, wow: 5, sad: 0, reportes: 2 },
    comentarios: [{ autor: 'Pedro', texto: 'Esto genera mal olor', fecha: new Date('2025-09-03') }],
    historial: [{ accion: 'Reporte creado', autor: 'Lucía Fernández', fecha: new Date('2025-09-03') }]
  },
  {
    id: 3,
    usuario: 'Breider Catashunga',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757540811/file_aqydn0.jpg',
    categoria: 'Seguridad',
    tipo: 'Seguridad',
    periodo: 'Esta semana',
    titulo: 'Robo en parque central',
    descripcion: 'Vecinos reportaron un robo anoche cerca del parque central.',
    estado: 'pendiente',
    prioridad: 'Alta',
    fecha: new Date('2025-09-04'),
    lat: undefined,
    lng: undefined,
    ubicacion: 'Parque Kennedy, Miraflores, Lima',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757787586/203920_394774_mobdrw.webp'],
    reacciones: { likes: 5, dislikes: 0, helpful: 3, love: 0, wow: 1, sad: 0, reportes: 1 },
    comentarios: [{ autor: 'Laura', texto: 'Debemos pedir más patrullaje', fecha: new Date('2025-09-04') }],
    historial: [{ accion: 'Reporte creado', autor: 'Andrés Gómez', fecha: new Date('2025-09-04') }]
  },
  {
    id: 4,
    usuario: 'María López',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491571/main-sample.png',
    categoria: 'Alumbrado',
    tipo: 'Infraestructura',
    periodo: 'Este mes',
    titulo: 'Farola parpadea',
    descripcion: 'La farola frente a mi casa parpadea constantemente.',
    estado: 'resuelto',
    prioridad: 'Baja',
    fecha: new Date('2025-08-28'),
    lat: undefined,
    lng: undefined,
    ubicacion: 'Calle Los Pinos 789, San Isidro, Lima',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757787597/655663_u3ycdh.webp'],
    reacciones: { likes: 9, dislikes: 4, helpful: 2, love: 1, wow: 7, sad: 1, reportes: 3 },
    comentarios: [{ autor: 'Carlos', texto: 'Gracias por reportar', fecha: new Date('2025-08-29') }],
    historial: [
      { accion: 'Reporte creado', autor: 'María López', fecha: new Date('2025-08-28') },
      { accion: 'Problema resuelto', autor: 'Municipalidad', fecha: new Date('2025-08-30') }
    ]
  },
  {
    id: 5,
    usuario: 'Pedro Sánchez',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491568/samples/man-portrait.jpg',
    categoria: 'Limpieza',
    tipo: 'Ambiental',
    periodo: 'Hoy',
    titulo: 'Papelera rota',
    descripcion: 'La papelera del parque está rota y la basura se cae.',
    estado: 'pendiente',
    prioridad: 'Alta',
    fecha: new Date('2025-09-05'),
    lat: undefined,
    lng: undefined,
    ubicacion: 'Parque de la Exposición, Cercado de Lima, Lima',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757787633/images_nzyale.jpg'],
    reacciones: { likes: 12, dislikes: 2, helpful: 4, love: 3, wow: 2, sad: 1, reportes: 3 },
    comentarios: [{ autor: 'Ana', texto: 'Esto atrae animales', fecha: new Date('2025-09-05') }],
    historial: [{ accion: 'Reporte creado', autor: 'Pedro Sánchez', fecha: new Date('2025-09-05') }]
  },
  {
    id: 6,
    usuario: 'Valeria Torres',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491569/samples/upscale-face-1.jpg',
    categoria: 'Parque',
    tipo: 'Seguridad',
    periodo: 'Hoy',
    titulo: 'Parque sucio',
    descripcion: 'Un auto sin placas lleva estacionado 2 días en la calle del parque.',
    estado: 'en progreso',
    prioridad: 'Baja',
    fecha: new Date('2025-09-06'),
    lat: undefined,
    lng: undefined,
    ubicacion: 'Parque de la Muralla, Lima Cercado, Lima',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757787635/1502568_ebwuqi.webp'],
    reacciones: { likes: 9, dislikes: 4, helpful: 2, love: 1, wow: 7, sad: 1, reportes: 3 },
    comentarios: [{ autor: 'Luis', texto: 'Podría ser peligroso', fecha: new Date('2025-09-06') }],
    historial: [{ accion: 'Reporte creado', autor: 'Valeria Torres', fecha: new Date('2025-09-06') }]
  },
  {
    id: 7,
    usuario: 'Diego Ramos',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491567/samples/smile.jpg',
    categoria: 'Alumbrado',
    tipo: 'Infraestructura',
    periodo: 'Esta semana',
    titulo: 'Poste derribado',
    descripcion: 'Un vehículo derribó el poste de alumbrado esta madrugada.',
    estado: 'pendiente',
    prioridad: 'Alta',
    fecha: new Date('2025-09-07'),
    lat: undefined,
    lng: undefined,
    ubicacion: 'Av. La Marina 321, San Miguel, Lima',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757787831/images_nkrvjf.jpg'],
    reacciones: { likes: 1, dislikes: 6, helpful: 1, love: 1, wow: 2, sad: 1, reportes: 3 },
    comentarios: [{ autor: 'Rosa', texto: 'Zona peligrosa sin luz', fecha: new Date('2025-09-07') }],
    historial: [{ accion: 'Reporte creado', autor: 'Diego Ramos', fecha: new Date('2025-09-07') }]
  },
  {
    id: 8,
    usuario: 'Ana Morales',
    usuarioAvatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491569/samples/woman-on-a-football-field.jpg',
    categoria: 'Semáforo',
    tipo: 'Infraestructura',
    periodo: 'Hoy',
    titulo: 'Semáforo dañado',
    descripcion: 'El semáforo de la esquina no funciona correctamente.',
    estado: 'pendiente',
    prioridad: 'Media',
    fecha: new Date('2025-09-08'),
    lat: undefined,
    lng: undefined,
    ubicacion: 'Av. Javier Prado 55, San Isidro, Lima',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757787973/LM5562NESVBZ3IRCHEAWGH4HQM_iyuzva.jpg'],
    reacciones: { likes: 9, dislikes: 4, helpful: 2, love: 1, wow: 7, sad: 1, reportes: 3 },
    comentarios: [{ autor: 'Sofía', texto: 'Deberían repararlo pronto', fecha: new Date('2025-09-08') }],
    historial: [{ accion: 'Reporte creado', autor: 'Ana Morales', fecha: new Date('2025-09-08') }]
  }
];
