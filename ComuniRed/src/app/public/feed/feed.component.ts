import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostCardComponent } from '../post-card/post-card.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent {
  posts = [
    {
      author: 'Juan Perez',
      date: '10 septiembre 2025',
      content: '¡Bienvenido a ComuniRed! Publica tu queja o consulta aquí.',
      imageUrl: '',
      likes: 2,
      liked: false,
      comments: [],
      showComments: false
    },
    {
      author: 'Ana Torres',
      date: '9 septiembre 2025',
      content: '¿Alguien sabe cómo contactar soporte directamente?',
      imageUrl: '',
      likes: 0,
      liked: false,
      comments: [],
      showComments: false
    }
  ];
}