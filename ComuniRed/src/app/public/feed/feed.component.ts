import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Comment {
  author: string;
  content: string;
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
}

interface Category {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent {
  searchQuery: string = '';
  selectedCategory: string = 'Todos';

  categories: Category[] = [
    { name: 'Todos', icon: '🌐' },
    { name: 'Vías', icon: '🛣️' },
    { name: 'Postes', icon: '💡' },
    { name: 'Grafitis', icon: '🎨' },
    { name: 'Alumbrado', icon: '🔦' },
    { name: 'Semáforos', icon: '🚦' },
    { name: 'Basura', icon: '🗑️' },
  ];

  posts: Post[] = [
    {
      id: '1',
      author: 'María González',
      avatar: 'https://i.pravatar.cc/150?img=1',
      date: 'hace 2 horas',
      location: 'Av. Javier Prado, Lima',
      title: 'Hueco gigante en la vía principal',
      content: 'Hay un hueco muy profundo que puede dañar los vehículos. Necesitamos reparación urgente.',
      category: 'Vías',
      imageUrl: 'https://images.unsplash.com/photo-1602193708681-3f1e4fa360c8?auto=format&fit=crop&w=800&q=80',
      likes: 12,
      liked: false,
      comments: [],
      showComments: false,
      bookmarked: false,
      acceptVotes: 23,
      rejectVotes: 3,
      userVote: null
    },
    {
      id: '2',
      author: 'Carlos Ruiz',
      avatar: 'https://i.pravatar.cc/150?img=2',
      date: 'hace 5 horas',
      location: 'Parque Central, Lima',
      title: 'Poste de luz dañado',
      content: 'El poste está inclinado y representa un peligro real para los peatones, especialmente de noche.',
      category: 'Postes',
      imageUrl: 'https://images.unsplash.com/photo-1552611053-5c9e97c54b42?auto=format&fit=crop&w=800&q=80',
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
      date: 'hace 1 día',
      location: 'Colegio San José, Lima',
      title: 'Grafitis vandálicos',
      content: 'Aparecieron nuevos grafitis ofensivos en el muro del colegio. Afecta la imagen del barrio.',
      category: 'Grafitis',
      imageUrl: 'https://images.unsplash.com/photo-1617692851466-1c177ee14c19?auto=format&fit=crop&w=800&q=80',
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
      date: 'hace 3 horas',
      location: 'Avenida Arequipa, Lima',
      title: 'Basura acumulada en la vía',
      content: 'Acumulación de basura afecta la circulación y genera malos olores en la zona.',
      category: 'Basura',
      imageUrl: 'https://images.unsplash.com/photo-1582257617852-5a0f7f1fdb36?auto=format&fit=crop&w=800&q=80',
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
      date: 'hace 1 hora',
      location: 'Plaza San Martín, Lima',
      title: 'Semáforo dañado',
      content: 'El semáforo no funciona desde esta mañana, generando caos vehicular.',
      category: 'Semáforos',
      imageUrl: 'https://images.unsplash.com/photo-1601891342091-0e5b46a4c30c?auto=format&fit=crop&w=800&q=80',
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
      date: 'hace 4 horas',
      location: 'Miraflores, Lima',
      title: 'Baches en la carretera',
      content: 'Varios baches en la avenida principal dificultan la conducción segura.',
      category: 'Vías',
      imageUrl: 'https://images.unsplash.com/photo-1561079795-2b9c7b8ff87d?auto=format&fit=crop&w=800&q=80',
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
      date: 'hace 2 días',
      location: 'San Isidro, Lima',
      title: 'Alumbrado público deficiente',
      content: 'Algunas calles no tienen suficiente iluminación, lo que genera inseguridad por las noches.',
      category: 'Alumbrado',
      imageUrl: 'https://images.unsplash.com/photo-1528249739834-5823d6f1e38c?auto=format&fit=crop&w=800&q=80',
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
  }

  toggleBookmark(post: Post) {
    post.bookmarked = !post.bookmarked;
  }

  toggleComments(post: Post) {
    post.showComments = !post.showComments;
  }

  vote(post: Post, choice: 'accept' | 'reject') {
    if (post.userVote === choice) return;
    if (post.userVote === 'accept') post.acceptVotes--;
    if (post.userVote === 'reject') post.rejectVotes--;

    if (choice === 'accept') post.acceptVotes++;
    if (choice === 'reject') post.rejectVotes++;

    post.userVote = choice;
  }

  sharePost(post: Post) {
    alert(`Compartir publicación: ${post.title}`);
  }

  addComment(post: Post, commentContent: string) {
    if (!commentContent.trim()) return;
    post.comments.push({ author: 'Tu Usuario', content: commentContent });
  }

  filteredPosts(): Post[] {
    return this.posts.filter(post =>
      (this.selectedCategory === 'Todos' || post.category === this.selectedCategory) &&
      (post.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
       post.content.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
       (post.location && post.location.toLowerCase().includes(this.searchQuery.toLowerCase())))
    );
  }
}
