import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../ajson/json';

@Component({
  selector: 'app-perfil-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-header.component.html',
  styleUrls: ['./perfil-header.component.css']
})
export class PerfilHeaderComponent {
  @Input() usuario!: Usuario;

  @Output() modificar = new EventEmitter<void>();
  @Output() salir = new EventEmitter<void>();

  mostrarMenu = false;

  toggleMenu() {
    this.mostrarMenu = !this.mostrarMenu;
  }

  onModificar() {
    this.modificar.emit();
    this.mostrarMenu = false;
  }

  onSalir() {
    this.salir.emit();
    this.mostrarMenu = false;
  }
}
