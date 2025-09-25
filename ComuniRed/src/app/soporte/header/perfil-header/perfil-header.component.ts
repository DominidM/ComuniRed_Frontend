import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Soporte } from '../../ajson/json';

@Component({
  selector: 'app-perfil-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-header.component.html',
  styleUrls: ['./perfil-header.component.css']
})
export class PerfilHeaderComponent {
  @Input() soporte!: Soporte;

  @Output() modificar = new EventEmitter<void>();
  @Output() salir = new EventEmitter<void>();

  mostrarMenu = false;
  constructor(private router: Router) {}

  toggleMenu() {
    this.mostrarMenu = !this.mostrarMenu;
  }

  onModificar() {
    this.modificar.emit();
    this.mostrarMenu = false;

    this.router.navigate(['/soporte/editar-perfil', this.soporte.id]);
  }

  onSalir() {
    this.salir.emit();
    this.mostrarMenu = false;
  }
}
