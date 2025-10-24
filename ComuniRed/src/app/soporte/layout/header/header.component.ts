import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PerfilHeaderComponent } from './perfil-header/perfil-header.component';
import { AccionesHeaderComponent } from './acciones-header/acciones-header.component';
import { LogoSectionComponent } from './logo-section/logo-section.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoSectionComponent, AccionesHeaderComponent, PerfilHeaderComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  @Input() soporte: any | null = null;

  @Output() modificar = new EventEmitter<void>();
  @Output() home = new EventEmitter<void>();
  @Output() salir = new EventEmitter<void>();

  actualizar() {
    console.log('Actualizando desde Header...');
  }

  exportar() {
    console.log('Exportando desde Header...');
  }

  onModificar() {
    this.modificar.emit();
  }

  onPrincipal() {
    this.home.emit();
  }

  onSalir() {
    this.salir.emit();
  }
}
