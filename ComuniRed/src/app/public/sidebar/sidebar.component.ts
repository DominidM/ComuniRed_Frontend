import { Component, EventEmitter, Input, Output } from '@angular/core';   
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router,RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface Report {
  title: string;
  description: string;
  category: string;
  location: string;
  image?: File;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, 
    RouterModule, 
    MatIconModule, 
    MatButtonModule, 
    FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  showModal = false;

  // Modal Form State
  title = '';
  description = '';
  category = '';
  location = '';
  image: File | null = null;
  imagePreview: string | null = null;
  categories = ['Vías', 'Alumbrado', 'Grafitis', 'Semáforos', 'Otros'];

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.image = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.image = null;
    this.imagePreview = null;
  }

  submitReport() {
    if (!this.title || !this.description || !this.category || !this.location) return;

    const report: Report = {
      title: this.title,
      description: this.description,
      category: this.category,
      location: this.location,
      image: this.image || undefined
    };

    console.log('Reporte creado:', report);
    this.closeModal();
  }

  resetForm() {
    this.title = '';
    this.description = '';
    this.category = '';
    this.location = '';
    this.removeImage();
  }

  menuItems = [
    { label: 'Inicio', icon: 'home', route: '/public/home' },
    { label: 'Tendencias', icon: 'trending_up', route: '/public/trending' },
    { label: 'Notificaciones', icon: 'notifications', route: '/public/notifications' },
    { label: 'Perfil', icon: 'person', route: '/public/profile/1' },
    { label: 'Configuración', icon: 'settings', route: '/public/settings' },
    { label: 'Ayuda', icon: 'help_outline', route: '/public/help' },
  ];

  user = {
    name: 'Tu Usuario',
    handle: '@tuusuario',
    avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
  };
}