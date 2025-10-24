import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rightbar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <aside class="rightbar">
      <!-- Tendencias -->
      <div class="card">
        <div class="card-header">
          <mat-icon class="header-icon">trending_up</mat-icon>
          <h3>Tendencias</h3>
        </div>
        <div class="trends-list">
          <div class="trend-item" *ngFor="let t of trends">
            <div class="trend-main">
              <span class="trend-tag">#{{ t.tag }}</span>
              <span class="trend-count">{{ t.count }}</span>
            </div>
            <p class="trend-desc">{{ t.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Áreas Cercanas -->
      <div class="card">
        <div class="card-header">
          <mat-icon class="header-icon">location_on</mat-icon>
          <h3>Áreas Cercanas</h3>
        </div>
        <div class="areas-list">
          <div class="area-item" *ngFor="let a of areas; let i = index">
            <div class="area-rank">#{{ i + 1 }}</div>
            <div class="area-info">
              <div class="area-name">{{ a.name }}</div>
              <div class="area-meta">{{ a.distance }} · {{ a.reports }} reportes</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="card stats-card">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ stats.today }}</div>
            <div class="stat-label">Reportes hoy</div>
          </div>
          <div class="stat-item">
            <div class="stat-value stat-success">{{ stats.solvedPercent }}%</div>
            <div class="stat-label">Resueltos</div>
          </div>
        </div>
      </div>

      <!-- Botón flotante de mensajes -->
      <button class="fab-button" (click)="openChat()" title="Abrir chat">
        <mat-icon>chat_bubble</mat-icon>
        <span class="fab-badge" *ngIf="unreadMessages > 0">{{ unreadMessages }}</span>
      </button>
    </aside>
  `,
  styles: [`
    .rightbar {
      width: 340px;
      padding: 0 16px 80px 16px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
    }

    /* Cards */
    .card {
      background: #ffffff;
      border-radius: 16px;
      padding: 30px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
      transition: box-shadow 200ms ease;
    }

    .card:hover {
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    }

    /* Card Header */
    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f1f5f9;
    }

    .header-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #64748b;
    }

    .card-header h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
    }

    /* Tendencias */
    .trends-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .trend-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .trend-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .trend-tag {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
    }

    .trend-count {
      background: #0f172a;
      color: #ffffff;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 12px;
      min-width: 28px;
      text-align: center;
    }

    .trend-desc {
      font-size: 13px;
      color: #64748b;
      margin: 0;
      line-height: 1.4;
    }

    /* Áreas Cercanas */
    .areas-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .area-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      border-radius: 10px;
      transition: background 150ms ease;
    }

    .area-item:hover {
      background: #f8fafc;
    }

    .area-rank {
      width: 28px;
      height: 28px;
      background: #f1f5f9;
      color: #64748b;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .area-info {
      flex: 1;
      min-width: 0;
    }

    .area-name {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 2px;
    }

    .area-meta {
      font-size: 12px;
      color: #64748b;
    }

    /* Categorías */
    .categories-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .category-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
    }

    .category-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .category-name {
      flex: 1;
      font-size: 14px;
      color: #0f172a;
      font-weight: 500;
    }

    .category-count {
      font-size: 13px;
      color: #64748b;
      font-weight: 600;
      background: #f1f5f9;
      padding: 4px 10px;
      border-radius: 10px;
    }

    /* Estadísticas */
    .stats-card {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border: none;
      color: #ffffff;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1;
      margin-bottom: 6px;
    }

    .stat-success {
      color: #4ade80;
    }

    .stat-label {
      font-size: 12px;
      color: #cbd5e1;
      font-weight: 500;
    }

    /* Botón flotante (FAB) */
    .fab-button {
      position: fixed;
      bottom: 32px;
      right: 32px;
      width: 56px;
      height: 56px;
      background: #0f172a;
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.3);
      transition: all 200ms ease;
      z-index: 1000;
    }

    .fab-button:hover {
      transform: scale(1.1);
      background: #1e293b;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.4);
    }

    .fab-button:active {
      transform: scale(0.95);
    }

    .fab-button mat-icon {
      color: #ffffff;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .fab-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      min-width: 20px;
      height: 20px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 6px;
      border: 2px solid #ffffff;
    }

    /* Responsive */
    @media (max-width: 1280px) {
      .rightbar {
        width: 280px;
      }
    }

    @media (max-width: 1024px) {
      .rightbar {
        display: none;
      }
      
      .fab-button {
        bottom: 24px;
        right: 24px;
      }
    }

    @media (max-width: 600px) {
      .fab-button {
        width: 52px;
        height: 52px;
        bottom: 20px;
        right: 20px;
      }
    }
  `]
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

  categories = [
    { name: 'Baches', count: 1, color: '#ef4444' },
    { name: 'Alumbrado Público', count: 1, color: '#f59e0b' },
    { name: 'Alcantarillado', count: 1, color: '#3b82f6' },
    { name: 'Basura', count: 1, color: '#10b981' },
    { name: 'Señalización', count: 1, color: '#8b5cf6' },
  ];
  
  stats = { today: 247, solvedPercent: 89 };
  unreadMessages = 3;

  openChat() {
    console.log('Abriendo chat...');
    // Aquí puedes abrir un modal, navegar a una ruta, etc.
  }
}