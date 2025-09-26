import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { LogoSectionComponent } from './logo-section/logo-section.component';
import { AccionesHeaderComponent } from './acciones-header/acciones-header.component';
import { PerfilHeaderComponent } from './perfil-header/perfil-header.component';

import { Usuario_soporte, Soporte } from '../json/json';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    LogoSectionComponent,
    AccionesHeaderComponent,
    PerfilHeaderComponent,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() soporte: Soporte = Usuario_soporte[1];

  constructor(private router: Router) {}
  
  actualizar() {
    console.log('🔄 Actualizando datos...');
  }

  exportar() {
    console.log('⬇ Exportando datos...');
  }

  modificar() {
    this.router.navigate(['/soporte/editar-perfil', this.soporte.id]);
  }

  principal() {
    this.router.navigate(['/soporte/home']);
  }

  salir() {
    this.router.navigate(['/login']);
  }
}
