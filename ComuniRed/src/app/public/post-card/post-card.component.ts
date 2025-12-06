import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommentListComponent } from '../comment-list/comment-list.component';

interface Comment {
  author: string;
  date: string;
  content: string;
}

export interface Post {
  author: string;
  date: string;
  content: string;
  imageUrl?: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
  showComments: boolean;
}

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    CommentListComponent
  ],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css']
})
export class PostCardComponent {
  @Input() post!: Post;

  getAvatarUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
  }

  toggleLike() {
    this.post.liked = !this.post.liked;
    this.post.likes += this.post.liked ? 1 : -1;
  }

  toggleComments() {
    this.post.showComments = !this.post.showComments;
  }
}