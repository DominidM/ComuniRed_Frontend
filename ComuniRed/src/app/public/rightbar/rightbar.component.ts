import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rightbar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './rightbar.component.html',
  styleUrls: ['./rightbar.component.css']
})
export class RightbarComponent implements OnInit, OnDestroy {
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

  accessibilityOpen = false;
  textScale = 1;
  isHighContrast = false;
  isReducedMotion = false;

  private onDocClick = this.handleDocumentClick.bind(this);
  private onKey = this.handleKeyDown.bind(this);

  ngOnInit(): void {
    const savedScale = parseFloat(localStorage.getItem('acc-textScale') || '1');
    this.textScale = isNaN(savedScale) ? 1 : savedScale;
    this.isHighContrast = localStorage.getItem('acc-highContrast') === '1';
    this.isReducedMotion = localStorage.getItem('acc-reducedMotion') === '1';

    // apply persisted
    document.documentElement.style.fontSize = `${Math.round(this.textScale * 100)}%`;
    if (this.isHighContrast) document.documentElement.classList.add('high-contrast');
    if (this.isReducedMotion) document.documentElement.classList.add('reduced-motion');

    // listen for outside clicks & Escape
    document.addEventListener('click', this.onDocClick, true);
    document.addEventListener('keydown', this.onKey, true);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocClick, true);
    document.removeEventListener('keydown', this.onKey, true);
  }

  toggleAccessibility(): void {
    console.log('toggleAccessibility called — current:', this.accessibilityOpen);
    this.accessibilityOpen = !this.accessibilityOpen;

    if (this.accessibilityOpen) {
      setTimeout(() => {
        const first = document.querySelector('.accessibility-panel button');
        if (first) (first as HTMLElement).focus();
      }, 60);
    } else {
      // return focus to the button
      setTimeout(() => {
        const btn = document.querySelector('.rightbar-accessibility-btn') as HTMLElement | null;
        if (btn) btn.focus();
      }, 10);
    }
  }

  increaseText(): void {
    this.textScale = Math.min(1.6, +(this.textScale + 0.1).toFixed(2));
    document.documentElement.style.fontSize = `${Math.round(this.textScale * 100)}%`;
    localStorage.setItem('acc-textScale', String(this.textScale));
  }

  decreaseText(): void {
    this.textScale = Math.max(0.8, +(this.textScale - 0.1).toFixed(2));
    document.documentElement.style.fontSize = `${Math.round(this.textScale * 100)}%`;
    localStorage.setItem('acc-textScale', String(this.textScale));
  }

  resetText(): void {
    this.textScale = 1;
    document.documentElement.style.fontSize = '100%';
    localStorage.removeItem('acc-textScale');
  }

  toggleHighContrast(): void {
    this.isHighContrast = !this.isHighContrast;
    if (this.isHighContrast) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('acc-highContrast', '1');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.removeItem('acc-highContrast');
    }
  }

  toggleReducedMotion(): void {
    this.isReducedMotion = !this.isReducedMotion;
    if (this.isReducedMotion) {
      document.documentElement.classList.add('reduced-motion');
      localStorage.setItem('acc-reducedMotion', '1');
    } else {
      document.documentElement.classList.remove('reduced-motion');
      localStorage.removeItem('acc-reducedMotion');
    }
  }

  private handleDocumentClick(e: Event): void {
    if (!this.accessibilityOpen) return;
    const target = e.target as Node;
    const panel = document.querySelector('.accessibility-panel') as HTMLElement | null;
    const button = document.querySelector('.rightbar-accessibility-btn') as HTMLElement | null;
    if (!panel) return;
    if (panel.contains(target) || (button && button.contains(target))) return;
    this.accessibilityOpen = false;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.accessibilityOpen && e.key === 'Escape') {
      this.accessibilityOpen = false;
      setTimeout(() => {
        const btn = document.querySelector('.rightbar-accessibility-btn') as HTMLElement | null;
        if (btn) btn.focus();
      }, 10);
    }
  }
}