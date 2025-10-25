import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { UsuarioService } from '../../services/usuario.service';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  date: string;
  location?: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
  showComments: boolean;
  bookmarked: boolean;
  acceptVotes: number;
  rejectVotes: number;
  userVote: 'accept' | 'reject' | null;
  status?: string;
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class FeedComponent {
  
  user: { name: string; avatarUrl: string } | null = null;

  constructor(private usuarioService: UsuarioService) {}

    ngOnInit(): void {
    const u = this.usuarioService.getUser();
    if (u) 
    {

      const avatar = (u as any).foto_perfil || 'assets/img/default-avatar.png'; // foto o imagen por defecto

      this.user = {name: 'Usuario', avatarUrl: avatar};
    } 
    else 
    {
      this.user = {name: 'Usuario', avatarUrl: 'assets/img/default-avatar.png'};
    }
  }
  posts: Post[] = [
    {
      id: '1',
      author: 'María González',
      avatar: 'https://i.pravatar.cc/150?img=1',
      date: '2025-09-22T12:00:00Z',
      location: 'Av. Javier Prado, Lima',
      title: 'Hueco gigante en la vía principal',
      content: 'Hay un hueco muy profundo que puede dañar los vehículos. Necesitamos reparación urgente.',
      category: 'Vías',
      imageUrl: 'https://res.cloudinary.com/drh7hhtpv/image/upload/v1758514328/RKYOVS2VXNFBTNCHR5P3LEWIVA_i0qjtn.avif',
      likes: 12,
      liked: false,
      comments: [],
      showComments: false,
      bookmarked: false,
      acceptVotes: 23,
      rejectVotes: 3,
      userVote: null,
      status: 'En Proceso'
    },
    {
      id: '2',
      author: 'Carlos Ruiz',
      avatar: 'https://i.pravatar.cc/150?img=2',
      date: '2025-09-22T08:00:00Z',
      location: 'Parque Central, Lima',
      title: 'Poste de luz dañado',
      content: 'El poste está inclinado y representa un peligro real para los peatones, especialmente de noche.',
      category: 'Postes',
      imageUrl: 'https://res.cloudinary.com/drh7hhtpv/image/upload/v1758514463/whatsapp-image-2023-08-21-at-10-17-04-am-1_632506_pir0fy.jpg',
      likes: 8,
      liked: true,
      comments: [],
      showComments: false,
      bookmarked: true,
      acceptVotes: 18,
      rejectVotes: 2,
      userVote: 'accept'
    },
    {
      id: '3',
      author: 'Ana López',
      avatar: 'https://i.pravatar.cc/150?img=3',
      date: '2025-09-21T09:00:00Z',
      location: 'Colegio San José, Lima',
      title: 'Grafitis vandálicos',
      content: 'Aparecieron nuevos grafitis ofensivos en el muro del colegio. Afecta la imagen del barrio.',
      category: 'Grafitis',
      imageUrl: 'https://res.cloudinary.com/drh7hhtpv/image/upload/v1758514517/images_rirk4l.jpg',
      likes: 15,
      liked: false,
      comments: [],
      showComments: false,
      bookmarked: false,
      acceptVotes: 12,
      rejectVotes: 8,
      userVote: null
    },
    {
      id: '4',
      author: 'Luis Fernández',
      avatar: 'https://i.pravatar.cc/150?img=4',
      date: '2025-09-22T10:00:00Z',
      location: 'Avenida Arequipa, Lima',
      title: 'Basura acumulada en la vía',
      content: 'Acumulación de basura afecta la circulación y genera malos olores en la zona.',
      category: 'Basura',
      imageUrl: 'https://res.cloudinary.com/drh7hhtpv/image/upload/v1758514987/basura_en_lima-800x386_wvta8l.jpg',
      likes: 5,
      liked: false,
      comments: [],
      showComments: false,
      bookmarked: false,
      acceptVotes: 10,
      rejectVotes: 2,
      userVote: null
    },
    {
      id: '5',
      author: 'Sofía Ramírez',
      avatar: 'https://i.pravatar.cc/150?img=5',
      date: '2025-09-23T18:00:00Z',
      location: 'Plaza San Martín, Lima',
      title: 'Semáforo dañado',
      content: 'El semáforo no funciona desde esta mañana, generando caos vehicular.',
      category: 'Semáforos',
      imageUrl: 'https://res.cloudinary.com/drh7hhtpv/image/upload/v1758515047/images_wbdmwz.jpg',
      likes: 7,
      liked: false,
      comments: [],
      showComments: false,
      bookmarked: false,
      acceptVotes: 15,
      rejectVotes: 0,
      userVote: null
    },
    {
      id: '6',
      author: 'Pedro Castillo',
      avatar: 'https://i.pravatar.cc/150?img=6',
      date: '2025-09-22T15:00:00Z',
      location: 'Miraflores, Lima',
      title: 'Baches en la carretera',
      content: 'Varios baches en la avenida principal dificultan la conducción segura.',
      category: 'Vías',
      imageUrl: 'https://diariocorreo.pe/resizer/v2/VGDO7I7QMJE6RGKYXHAF7TDEBI.jpg?auth=8e20842107d59ec66137e883f53cff95c574b63d95a86da04a855a277bbdc667&width=640&quality=75&smart=true',
      likes: 11,
      liked: false,
      comments: [],
      showComments: false,
      bookmarked: false,
      acceptVotes: 20,
      rejectVotes: 3,
      userVote: null
    },
    {
      id: '7',
      author: 'Valeria Torres',
      avatar: 'https://i.pravatar.cc/150?img=7',
      date: '2025-09-20T21:00:00Z',
      location: 'San Isidro, Lima',
      title: 'Alumbrado público deficiente',
      content: 'Algunas calles no tienen suficiente iluminación, lo que genera inseguridad por las noches.',
      category: 'Alumbrado',
      imageUrl: 'https://res.cloudinary.com/drh7hhtpv/image/upload/v1758515179/QJOYXOI5LJCGDH34HEGGOZ6ZZI_oofduz.jpg',
      likes: 9,
      liked: false,
      comments: [],
      showComments: false,
      bookmarked: false,
      acceptVotes: 13,
      rejectVotes: 4,
      userVote: null
    }
  ];

  toggleLike(post: Post) {
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    if (post.liked) this.showLikeAnimation(post.id);
  }

  toggleBookmark(post: Post) {
    post.bookmarked = !post.bookmarked;
    if (post.bookmarked) {
      console.log(`Post "${post.title}" guardado en favoritos`);
    }
  }

  toggleComments(post: Post) {
    post.showComments = !post.showComments;
  }

  vote(post: Post, choice: 'accept' | 'reject') {
    if (post.userVote !== null) return;
    if (post.userVote === 'accept') post.acceptVotes--;
    if (post.userVote === 'reject') post.rejectVotes--;

    if (choice === 'accept') post.acceptVotes++;
    if (choice === 'reject') post.rejectVotes++;

    post.userVote = choice;
    console.log(`Voto registrado: ${choice} para "${post.title}"`);
  }

  sharePost(post: Post) {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href
      }).catch(console.error);
    } else {
      const shareText = `${post.title}\n${post.content}\n\nVía ComuniRed`;
      navigator.clipboard.writeText(shareText).then(() => {
        console.log('Enlace copiado al portapapeles');
      }).catch(() => {
        alert(`Compartir publicación: ${post.title}`);
      });
    }
  }

  addComment(post: Post, commentContent: string) {
    if (!commentContent.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: 'Tu Usuario',
      content: commentContent.trim(),
      timestamp: new Date()
    };

    post.comments.push(newComment);
    console.log(`Comentario agregado a "${post.title}"`);
  }

  // Downloads: fetch blob + helpers
  private async fetchBlob(url: string): Promise<Blob | null> {
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.blob();
    } catch (err) {
      console.error('fetchBlob error:', err);
      return null;
    }
  }

  async downloadImage(post: Post) {
    if (!post.imageUrl) {
      alert('No hay imagen disponible para descargar.');
      return;
    }

    const blob = await this.fetchBlob(post.imageUrl);
    if (!blob) {
      alert('No se pudo descargar la imagen. Revisa la consola para más detalles.');
      return;
    }

    const urlParts = post.imageUrl.split('?')[0].split('.');
    const ext = urlParts.length ? urlParts[urlParts.length - 1] : 'jpg';
    const safeExt = ext.length > 5 ? 'jpg' : ext;
    const filename = `${post.id || 'reporte'}.${safeExt}`;

    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  }

  downloadPostJson(post: Post) {
    const data = {
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author,
      date: post.date,
      location: post.location,
      category: post.category,
      acceptVotes: post.acceptVotes,
      rejectVotes: post.rejectVotes,
      likes: post.likes
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${post.id || 'report'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // simplified: return the posts array directly since search/categories were removed from UI
  filteredPosts(): Post[] {
    return this.posts;
  }

  trackByPostId(index: number, post: any): number | string {
    return post.id ?? index; // usa post.id si existe, si no el índice
  }

  trackByComment(index: number, comment: any): number | string {
    return comment.id ?? index; // usa comment.id si existe, si no el índice
  }

  private showLikeAnimation(postId: string) {
    console.log(`❤️ Like animation for post ${postId}`);
  }

  formatDate(dateString: string): string {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'hace unos minutos';
    if (diffInHours < 24) return `hace ${diffInHours} horas`;
    if (diffInHours < 48) return 'hace 1 día';
    return `hace ${Math.floor(diffInHours / 24)} días`;
  }
}