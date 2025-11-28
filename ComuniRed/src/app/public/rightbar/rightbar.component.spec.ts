import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rightbar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './rightbar.component.html',
  styleUrls: ['./rightbar.component.css']
})
export class RightbarComponent {
  trends = [
    { tag: 'VíasEnMalEstado', count: 45, desc: 'Múltiples reportes sobre huecos y daños' },
    { tag: 'AlumbradoPúblico', count: 23, desc: 'Postes dañados en varios sectores' },
    { tag: 'SemáforosDañados', count: 18, desc: 'Intersecciones con problemas' },
  ];
  
  areas = [
    { name: 'Centro Histórico', distance: '0.5 km', reports: 34 },
    { name: 'Zona Rosa', distance: '1.2 km', reports: 28 },
    { name: 'Barrio Norte', distance: '2.1 km', reports: 19 },
    { name: 'Sector Industrial', distance: '3.5 km', reports: 15 },
  ];
  
  stats = { today: 247, solvedPercent: 89 };

  toggleAccessibility() {
    console.log('Abriendo opciones de accesibilidad...');
    // Implementar modal o panel de accesibilidad
  }
}