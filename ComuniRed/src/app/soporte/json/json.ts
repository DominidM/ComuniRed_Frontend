export interface Reacciones {
  likes?: number;
  dislikes?: number;
  reportes?: number; 
  helpful?: number;
  love?: number;
  wow?: number;
  sad?: number;
}

export interface Soporte {
  id: number;
 
  nombre: string;
  apellido: string;

  username: string;
  
  avatar_soporte: string;
  email: string;
  telefono: string;

  turno: 'Dia' | 'Tarde' | 'noche';

  fecha_ingreso: Date;
  fecha_nacimiento: Date;

  estado: 'activo' | 'inactivo';

  responsable?: {
    nombres: string;
    apellidos: string;
    telefono: string;
    relacion?: string;
  };
}

export interface Comentario {
  autor: string;
  texto: string;
  fecha: Date;
}


export interface Historial {
  id: number;
  fecha?: Date;
  mensaje?: string;
  estado?: 'enviado' | 'observado' | 'en progreso' | 'resuelto';
}

export interface Reporte {
  id: number;
  cliente: Cliente;
  soporte: Soporte;
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

  imagenPrincipal?: string;

  imagenes: string[];

  reacciones: Reacciones;
  comentarios: Comentario[];
  
  historial?: Historial[];
}

export interface Cliente {
  id: number;
  nombre: string;
  avatar_cliente?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}



export const Usuario_soporte: Soporte[] = [
  {
    id: 1,
    nombre: "Carlos",
    apellido: "Ramírez",
    username: "carlos.ramirez",
    avatar_soporte: "https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757493645/Poses-Perfil-Profesional-Hombresdic.-27-2022-3-819x1024_p76mzs.webp",
    email: "carlos.ramirez@gmail.com",
    telefono: "+51 987 654 321",
    turno: "Dia",
    fecha_ingreso: new Date("2023-05-10"),
    fecha_nacimiento: new Date("1990-03-15"),
    estado: "activo",
    responsable: {
      nombres: "Luis",
      apellidos: "Ramírez",
      telefono: "+51 912 345 678",
      relacion: "Hermano"
    }
  },
  {
    id: 2,
    nombre: "María",
    apellido: "Fernández",
    username: "maria.fernandez",
    avatar_soporte: "assets/avatars/maria.png",
    email: "maria.fernandez@example.com",
    telefono: "+51 976 123 456",
    turno: "Tarde",
    fecha_ingreso: new Date("2022-08-15"),
    fecha_nacimiento: new Date("1995-07-20"),
    estado: "activo",
    responsable: {
      nombres: "Ana",
      apellidos: "Fernández",
      telefono: "+51 934 876 543",
      relacion: "Madre"
    }
  },
  {
    id: 3,
    nombre: "Jorge",
    apellido: "Salazar",
    username: "jorge.salazar",
    avatar_soporte: "assets/avatars/jorge.png",
    email: "jorge.salazar@example.com",
    telefono: "+51 965 432 198",
    turno: "noche",
    fecha_ingreso: new Date("2021-11-30"),
    fecha_nacimiento: new Date("1988-12-05"),
    estado: "inactivo",
    responsable: {
      nombres: "Pedro",
      apellidos: "Salazar",
      telefono: "+51 923 567 890",
      relacion: "Padre"
    }
  }
];




export const Usuario_cliente: Cliente[] = [
  { 
    id: 1,
    nombre: 'Maria Alvarez', 
    avatar_cliente: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491885/Perfil-Profesional-_280_1-819x1024_o7hvjh.webp', 
    telefono: '+51 987 654 321' 
  },
  {
    id: 2,
    nombre: 'Mario Gutierrez', 
    avatar_cliente: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757493578/images_lxxuza.jpg', 
    telefono: '+51 987 213 891' 
  },
  { 
    id: 3,
    nombre: 'Breider Catashunga', 
    avatar_cliente: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757540811/file_aqydn0.jpg', telefono: '+51 911 920 950' 
  },
  { 
    id: 4,
    nombre: 'María López', 
    avatar_cliente: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491571/main-sample.png', telefono: '+51 980 210 502' 
  },
  { 
    id: 5,
    nombre: 'Pedro Sánchez', 
    avatar_cliente: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491568/samples/man-portrait.jpg', 
    telefono: '+51 987 662 521' },
  { 
    id: 6,
    nombre: 'Valeria Torres', 
    avatar_cliente: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491569/samples/upscale-face-1.jpg', 
    telefono: '+51 987 654 441' },
  {
    id: 7, 
    nombre: 'Diego Ramos', 
    avatar_cliente: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491567/samples/smile.jpg', 
    telefono: '+51 987 654 300' 
  },
  {
    id: 8,
    nombre: 'Ana Morales', 
    avatar_cliente: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491569/samples/woman-on-a-football-field.jpg', 
    telefono: '+51 987 004 321' 
  }
];

export const historial: Historial[] = [
  {
    id: 1,
    mensaje: 'Reporte recibido y registrado en el sistema',
    fecha: new Date(2025, 8, 20, 1, 0),
    estado: 'enviado'
  },
  {
    id: 2,
    mensaje: 'Se está revisando el problema',
    fecha: new Date(2025, 8, 20, 1, 5),
    estado: 'observado'
  },
  {
    id: 3,
    mensaje: 'Problema en progreso',
    fecha: new Date(2025, 8, 20, 1, 10),
    estado: 'en progreso'
  },
  {
    id: 4,
    mensaje: 'Problema resuelto',
    fecha: new Date(2025, 8, 20, 1, 15),
    estado: 'resuelto'
  }
];
export const REPORTES: Reporte[] = [
  {
    id: 1,
    cliente: Usuario_cliente[0],
    soporte: Usuario_soporte[0],
    categoria: 'Alumbrado',
    tipo: 'Infraestructura',
    periodo: 'Esta semana',
    titulo: 'Poste en mal estado',
    descripcion: 'El poste de la esquina no tiene luz desde hace 3 días.',
    estado: 'pendiente',
    prioridad: 'Alta',
    fecha: new Date(2025, 6, 6, 6, 10),
    ubicacion: 'Av. Arequipa 123, Miraflores, Lima',
    lat: undefined,
    lng: undefined,
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757491814/poste-barrios-altos2_542958_twyi5f.jpg'],
    reacciones: { likes: 5, dislikes: 2, helpful: 3, love: 0, wow: 5, sad: 0, reportes: 3 },
    comentarios: [{ autor: 'María', texto: 'Yo también lo vi', fecha: new Date(2025, 6, 6, 6, 10) }],
    historial: historial.filter(h => h.id <= 1)
  },
  {
    id: 2,
    cliente: Usuario_cliente[1],
    soporte: Usuario_soporte[0],
    categoria: 'Limpieza',
    tipo: 'Ambiental',
    periodo: 'Hoy',
    titulo: 'Basura acumulada',
    descripcion: 'Varias bolsas de basura llevan más de 2 días sin ser recogidas.',
    estado: 'en progreso',
    fecha: new Date(2025, 6, 6, 6, 20),
    prioridad: 'Media',
    ubicacion: 'Jr. Cusco 456, Cercado de Lima, Lima',
    lat: undefined,
    lng: undefined,
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757787551/a09ffa08-24fb-4593-9c48-0183b0fee4bf_bwj8fs.jpg'],
    reacciones: { likes: 5, dislikes: 0, helpful: 3, love: 0, wow: 5, sad: 0, reportes: 2 },
    comentarios: [{ autor: 'Pedro', texto: 'Esto genera mal olor', fecha: new Date(2025, 6, 6, 6, 10) }],
    historial: historial.filter(h => h.id <= 4)
    
  },
  {
    id: 3,
    cliente: Usuario_cliente[2],
    soporte: Usuario_soporte[0],
    categoria: 'Seguridad',
    tipo: 'Seguridad',
    periodo: 'Esta semana',
    titulo: 'Robo en parque central',
    descripcion: 'Vecinos reportaron un robo anoche cerca del parque central.',
    estado: 'pendiente',
    prioridad: 'Alta',
    fecha: new Date(2025, 6, 6, 6, 20),
    lat: undefined,
    lng: undefined,
    ubicacion: 'Parque Kennedy, Miraflores, Lima',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757787586/203920_394774_mobdrw.webp'],
    reacciones: { likes: 5, dislikes: 0, helpful: 3, love: 0, wow: 1, sad: 0, reportes: 1 },
    comentarios: [{ autor: 'Laura', texto: 'Debemos pedir más patrullaje', fecha: new Date(2025, 6, 6, 6, 10) }],
    historial: historial.filter(h => h.id <= 4)
  },
  {
    id: 4,
    cliente: Usuario_cliente[3],
    soporte: Usuario_soporte[0],
    categoria: 'Alumbrado',
    tipo: 'Infraestructura',
    periodo: 'Este mes',
    titulo: 'Farola parpadea',
    descripcion: 'La farola frente a mi casa parpadea constantemente.',
    estado: 'resuelto',
    prioridad: 'Baja',
    fecha: new Date(2025, 6, 6, 6, 20),
    lat: undefined,
    lng: undefined,
    ubicacion: 'Calle Los Pinos 789, San Isidro, Lima',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757787597/655663_u3ycdh.webp'],
    reacciones: { likes: 9, dislikes: 4, helpful: 2, love: 1, wow: 7, sad: 1, reportes: 3 },
    comentarios: [{ autor: 'Carlos', texto: 'Gracias por reportar', fecha: new Date(2025, 6, 6, 6, 10) }],
    historial: historial.filter(h => h.id <= 4)
  },
  {
    id: 5,
    cliente: Usuario_cliente[4],
    soporte: Usuario_soporte[0],
    categoria: 'Limpieza',
    tipo: 'Ambiental',
    periodo: 'Hoy',
    titulo: 'Papelera rota',
    descripcion: 'La papelera del parque está rota y la basura se cae.',
    estado: 'pendiente',
    prioridad: 'Alta',
    fecha: new Date(2025, 1, 9, 19, 55),
    lat: undefined,
    lng: undefined,
    ubicacion: 'Parque de la Exposición, Cercado de Lima, Lima',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757787633/images_nzyale.jpg'],
    reacciones: { likes: 12, dislikes: 2, helpful: 4, love: 3, wow: 2, sad: 1, reportes: 3 },
    comentarios: [{ autor: 'Ana', texto: 'Esto atrae animales', fecha: new Date(2025, 6, 6, 6, 10) }],
    historial: historial.filter(h => h.id <= 4)
  },
  {
    id: 6,
    cliente: Usuario_cliente[5],
    soporte: Usuario_soporte[0],
    categoria: 'Parque',
    tipo: 'Seguridad',
    periodo: 'Hoy',
    titulo: 'Parque sucio',
    descripcion: 'Un auto sin placas lleva estacionado 2 días en la calle del parque.',
    estado: 'en progreso',
    prioridad: 'Baja',
    fecha: new Date(2025, 4, 9, 11, 55),
    lat: undefined,
    lng: undefined,
    ubicacion: 'Parque de la Muralla, Lima Cercado, Lima',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757787635/1502568_ebwuqi.webp'],
    reacciones: { likes: 9, dislikes: 4, helpful: 2, love: 1, wow: 7, sad: 1, reportes: 3 },
    comentarios: [{ autor: 'Luis', texto: 'Podría ser peligroso', fecha: new Date(2025, 6, 6, 6, 10) }],
    historial: historial.filter(h => h.id <= 4)
  },
  {
    id: 7,
    cliente: Usuario_cliente[6],
    soporte: Usuario_soporte[0],
    categoria: 'Alumbrado',
    tipo: 'Infraestructura',
    periodo: 'Esta semana',
    titulo: 'Poste derribado',
    descripcion: 'Un vehículo derribó el poste de alumbrado esta madrugada.',
    estado: 'pendiente',
    prioridad: 'Alta',
    fecha: new Date(2025, 8, 1, 15, 30),
    lat: undefined,
    lng: undefined,
    ubicacion: 'Av. La Marina 321, San Miguel, Lima',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757787831/images_nkrvjf.jpg'],
    reacciones: { likes: 1, dislikes: 6, helpful: 1, love: 1, wow: 2, sad: 1, reportes: 3 },
    comentarios: [{ autor: 'Rosa', texto: 'Zona peligrosa sin luz', fecha: new Date(2025, 6, 6, 6, 10) }],
    historial: historial.filter(h => h.id <= 4)
  },
  {
    id: 8,
    cliente: Usuario_cliente[7],
    soporte: Usuario_soporte[0],
    categoria: 'Semáforo',
    tipo: 'Infraestructura',
    periodo: 'Hoy',
    titulo: 'Semáforo dañado',
    descripcion: 'El semáforo de la esquina no funciona correctamente.',
    estado: 'pendiente',
    prioridad: 'Media',
    fecha: new Date(2025, 7, 25, 12, 30),
    lat: undefined,
    lng: undefined,
    ubicacion: 'Av. Javier Prado 55, San Isidro, Lima',
    imagenes: ['https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757787973/LM5562NESVBZ3IRCHEAWGH4HQM_iyuzva.jpg'],
    reacciones: { likes: 9, dislikes: 4, helpful: 2, love: 1, wow: 7, sad: 1, reportes: 3 },
    comentarios: [{ autor: 'Sofía', texto: 'Deberían repararlo pronto', fecha: new Date(2025, 6, 6, 6, 10) }],
    historial: historial.filter(h => h.id <= 4)
  }
];

