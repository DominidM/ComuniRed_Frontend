import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';


import { LogoSectionComponent } from './logo-section/logo-section.component';
//import { AccionesHeaderComponent } from './acciones-header/acciones-header.component';
import { PerfilHeaderComponent } from './perfil-header/perfil-header.component';


import { Usuario_soporte, Soporte } from '../ajson/json';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    LogoSectionComponent,
    //AccionesHeaderComponent,
    PerfilHeaderComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent 
{
  usuario: Soporte = Usuario_soporte[0];

  constructor(private router: Router) {}
  
  actualizar() {
    console.log('🔄 Actualizando datos...');
  }

  exportar() {
    console.log('⬇ Exportando datos...');
  }

  modificar() {
    console.log('✏ Modificar perfil...');
  }

  salir() {
    this.router.navigate(['/login']);
  }
}
