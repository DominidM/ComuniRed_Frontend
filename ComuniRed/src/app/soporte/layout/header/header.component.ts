import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="app-header">
    <div class="header-left">
      <a class="logo" routerLink="/public/home">ComuniRed</a>
    </div>

    <div class="header-center">
      <ng-content select="app-acciones-header"></ng-content>
    </div>

    <div class="header-right">
      <div class="profile" *ngIf="soporte">
        <img class="avatar" [src]="soporte.avatar_soporte || defaultAvatar" alt="avatar" />
        <div class="profile-info">
          <div class="name">{{ soporte.nombre }} {{ soporte.apellido }}</div>
          <div class="status">En línea</div>
        </div>
      </div>

      <button class="btn btn-ghost" (click)="onHome()">Inicio</button>
      <button class="btn btn-outline" (click)="onModificar()">Editar</button>
      <button class="btn btn-danger" (click)="onSalir()">Cerrar Sesión</button>
    </div>
  </div>
  `,
  styles: [`
    .app-header {
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:12px 16px;
      background:#fff;
      border-bottom:1px solid #e6e6e6;
      gap:12px;
    }
    .header-left .logo { font-weight:700; color:#111; text-decoration:none; }
    .header-center { flex:1; display:flex; justify-content:center; }
    .header-right { display:flex; align-items:center; gap:12px; }
    .profile { display:flex; align-items:center; gap:8px; margin-right:8px; }
    .avatar { width:36px; height:36px; border-radius:50%; object-fit:cover; }
    .profile-info .name { font-weight:600; font-size:14px; }
    .profile-info .status { font-size:12px; color:green; }
    .btn { padding:6px 10px; border-radius:6px; cursor:pointer; border:1px solid transparent; background:#f5f5f5; }
    .btn-ghost { background:transparent; border:none; }
    .btn-outline { background:transparent; border:1px solid #ccc; }
    .btn-danger { background:#e74c3c; color:white; border:1px solid #e74c3c; }
  `]
})
export class HeaderComponent {
  @Input() soporte: any | null = null;
  @Input() defaultAvatar = 'https://res.cloudinary.com/dpnxbnqxu/image/upload/v1757493645/Poses-Perfil-Profesional-Hombresdic.-27-2022-3-819x1024_p76mzs.webp';

  @Output() modificar = new EventEmitter<void>();
  @Output() home = new EventEmitter<void>();
  @Output() salir = new EventEmitter<void>();

  onModificar() { this.modificar.emit(); }
  onHome() { this.home.emit(); }
  onSalir() { this.salir.emit(); }
}