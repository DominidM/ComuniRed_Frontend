import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PostCardComponent } from '../post-card/post-card.component';

interface Comment {
  author: string;
  date: string;
  content: string;
}

interface Post {
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
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    PostCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  newPostContent = '';
  selectedImage: File | null = null;
  previewImage: string | null = null;
  imageUrlInput: string = '';

  posts: Post[] = [
    {
      author: 'Usuario actual',
      date: '13/9/2025',
      content: 'CVC',
      imageUrl: 'https://res.cloudinary.com/dxuk9bogw/image/upload/v1757487061/DSC_0774-585x392_szjl59.jpg',
      likes: 0,
      liked: false,
      comments: [],
      showComments: false
    }
  ];

  removeImage() {
    this.previewImage = null;
    this.selectedImage = null;
    this.imageUrlInput = '';
  }

  onImageSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedImage = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.previewImage = reader.result as string;
      if (this.selectedImage) {
        reader.readAsDataURL(this.selectedImage);
      }
      this.imageUrlInput = '';
    }
  }

  onImageUrlChange() {
    if (this.imageUrlInput.trim()) {
      this.previewImage = this.imageUrlInput.trim();
      this.selectedImage = null;
    } else {
      this.previewImage = null;
    }
  }

  publishPost() {
    if (!this.newPostContent.trim() && !this.previewImage) return;
    this.posts.unshift({
      author: 'Usuario actual',
      date: new Date().toLocaleDateString('es-ES'),
      content: this.newPostContent,
      imageUrl: this.previewImage || undefined,
      likes: 0,
      liked: false,
      comments: [],
      showComments: false
    });
    this.newPostContent = '';
    this.previewImage = null;
    this.selectedImage = null;
    this.imageUrlInput = '';
  }
}