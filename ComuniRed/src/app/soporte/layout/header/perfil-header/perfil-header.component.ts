import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Soporte, Usuario_soporte } from '../../../json/json';

@Component({
  selector: 'app-perfil-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-header.component.html',
  styleUrls: ['./perfil-header.component.css']
})
export class PerfilHeaderComponent {
  @Input() soporte : Soporte = Usuario_soporte[0] ;

  @Output() principal = new EventEmitter<void>();
  @Output() modificar = new EventEmitter<void>();
  @Output() salir = new EventEmitter<void>();

  mostrarMenu = false;

  toggleMenu() {
    this.mostrarMenu = !this.mostrarMenu;
  }

  private cerrarMenu() {
    this.mostrarMenu = false;
  }

  onPrincipal() {
    this.principal.emit();
    this.cerrarMenu();
  }

  onModificar() {
    this.modificar.emit();
    this.cerrarMenu();
  }

  onSalir() {
    this.salir.emit();
    this.cerrarMenu();
  }
}
