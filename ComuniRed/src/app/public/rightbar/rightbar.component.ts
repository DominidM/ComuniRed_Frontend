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
    { hashtag: '#VíasEnMalEstado', count: 45, desc: 'Múltiples reportes sobre huecos y daños' },
    { hashtag: '#AlumbradoPúblico', count: 23, desc: 'Postes dañados en varios sectores' },
    { hashtag: '#SemáforosDañados', count: 18, desc: 'Intersecciones con problemas' },
    { hashtag: '#ParqueSucio', count: 12, desc: 'Reportes de basura en parques' },
  ];

  districts = [
    { name: 'Centro Histórico', distance: '0.5 km', count: 34 },
    { name: 'Zona Rosa', distance: '1.2 km', count: 28 },
    { name: 'Barrio Norte', distance: '2.1 km', count: 19 },
    { name: 'Sector Industrial', distance: '3.5 km', count: 15 },
  ];

  reportsToday = 247;
  resolvedPercent = 89;
}