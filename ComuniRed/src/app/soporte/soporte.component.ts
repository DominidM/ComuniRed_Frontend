import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Soporte, Usuario_soporte } from './json/json';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-soporte',
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.css']
})
export class SoporteComponent implements OnInit {
  
  soporte: Soporte = Usuario_soporte[0];

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('Soporte cargado:', this.soporte);
  }

  onModificarPerfil() 
  {
    this.router.navigate(['/soporte/editar-perfil', this.soporte.id]);
  }
  onPrincipal()
  {
    this.router.navigate(['/soporte/home']);
  }
  onSalir() 
  {
    this.router.navigate(['/login']);
  }
}
