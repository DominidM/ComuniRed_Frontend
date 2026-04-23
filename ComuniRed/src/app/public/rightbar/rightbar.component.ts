import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export interface ChatPreview {
  id: string;
  name: string;
  initials: string;
  color: string;
  preview: string;
  time: string;
  online: boolean;
  unread: boolean;
  unreadCount?: number;
}

@Component({
  selector: 'app-rightbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './rightbar.component.html',
  styleUrls: ['./rightbar.component.css'],
})
export class RightbarComponent implements OnInit, OnDestroy {

  // ── Mensajes (mock — reemplazar con servicio real) ────────────────
  mensajes: ChatPreview[] = [
    { id: '1', name: 'Ana López',    initials: 'AL', color: 'linear-gradient(135deg,#667eea,#764ba2)', preview: '¿Viste el reporte de ayer?', time: '2m',  online: true,  unread: true,  unreadCount: 2 },
    { id: '2', name: 'Carlos Ríos',  initials: 'CR', color: 'linear-gradient(135deg,#f093fb,#f5576c)', preview: 'Ok, lo reviso ahora mismo',   time: '14m', online: true,  unread: false },
    { id: '3', name: 'María Vega',   initials: 'MV', color: 'linear-gradient(135deg,#4facfe,#00f2fe)', preview: 'Gracias por el seguimiento',   time: '1h',  online: false, unread: false },
  ];

  // ── Tendencias ────────────────────────────────────────────────────
  trends = [
    { tag: 'VíasEnMalEstado',  count: 45, desc: 'Múltiples reportes sobre huecos' },
    { tag: 'AlumbradoPúblico', count: 23, desc: 'Postes dañados en varios sectores' },
    { tag: 'AguaPotable',      count: 18, desc: 'Cortes reportados en la zona' },
  ];

  // ── Estadísticas ──────────────────────────────────────────────────
  stats = { today: 247, solvedPercent: 89 };

  // ── Accesibilidad ─────────────────────────────────────────────────
  accessibilityOpen = false;
  textScale = 1;
  isHighContrast = false;
  isReducedMotion = false;

  private onDocClick = this.handleDocumentClick.bind(this);
  private onKey = this.handleKeyDown.bind(this);

  constructor(private router: Router) {}

  ngOnInit(): void {
    const savedScale = parseFloat(localStorage.getItem('acc-textScale') || '1');
    this.textScale = isNaN(savedScale) ? 1 : savedScale;
    this.isHighContrast = localStorage.getItem('acc-highContrast') === '1';
    this.isReducedMotion = localStorage.getItem('acc-reducedMotion') === '1';

    document.documentElement.style.fontSize = `${Math.round(this.textScale * 100)}%`;
    if (this.isHighContrast) document.documentElement.classList.add('high-contrast');
    if (this.isReducedMotion) document.documentElement.classList.add('reduced-motion');

    document.addEventListener('keydown', this.onKey, true);
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onKey, true);
  }

  // ── Mensajes ──────────────────────────────────────────────────────
  onAbrirChat(chat: ChatPreview): void {
    this.router.navigate(['/public/messages', chat.id]);
  }

  onNuevoMensaje(): void {
    this.router.navigate(['/public/messages/new']);
  }

  // ── Accesibilidad ─────────────────────────────────────────────────
  toggleAccessibility(): void {
    this.accessibilityOpen = !this.accessibilityOpen;
  }

  increaseText(): void {
    this.textScale = Math.min(1.6, +(this.textScale + 0.1).toFixed(2));
    this.applyTextScale();
  }

  decreaseText(): void {
    this.textScale = Math.max(0.8, +(this.textScale - 0.1).toFixed(2));
    this.applyTextScale();
  }

  resetText(): void {
    this.textScale = 1;
    this.applyTextScale();
    localStorage.removeItem('acc-textScale');
  }

  toggleHighContrast(): void {
    this.isHighContrast = !this.isHighContrast;
    document.documentElement.classList.toggle('high-contrast', this.isHighContrast);
    this.isHighContrast
      ? localStorage.setItem('acc-highContrast', '1')
      : localStorage.removeItem('acc-highContrast');
  }

  toggleReducedMotion(): void {
    this.isReducedMotion = !this.isReducedMotion;
    document.documentElement.classList.toggle('reduced-motion', this.isReducedMotion);
    this.isReducedMotion
      ? localStorage.setItem('acc-reducedMotion', '1')
      : localStorage.removeItem('acc-reducedMotion');
  }

  private applyTextScale(): void {
    document.documentElement.style.fontSize = `${Math.round(this.textScale * 100)}%`;
    localStorage.setItem('acc-textScale', String(this.textScale));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.accessibilityOpen && e.key === 'Escape') {
      this.accessibilityOpen = false;
    }
  }

  private handleDocumentClick(e: Event): void {
    // ya no es flotante, no hace falta cerrar al click fuera
  }
}