import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  posts = [
    {
      author: 'Juan Perez',
      date: '10 septiembre 2025',
      content: '¡Bienvenido a ComuniRed! Publica tu queja o consulta aquí.'
    },
    {
      author: 'Ana Torres',
      date: '9 septiembre 2025',
      content: '¿Alguien sabe cómo contactar soporte directamente?'
    }
  ];
}