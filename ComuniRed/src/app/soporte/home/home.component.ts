import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../soporte.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  mostrarMenu = false;

  usuario: Usuario = {
    nombre: 'Carlos Ruiz',
    avatar: 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757493645/Poses-Perfil-Profesional-Hombresdic.-27-2022-3-819x1024_p76mzs.webp'
  };

  toggleMenu() {
    this.mostrarMenu = !this.mostrarMenu;
  }

  salir() {
    console.log('Usuario ha salido');
  }
}
