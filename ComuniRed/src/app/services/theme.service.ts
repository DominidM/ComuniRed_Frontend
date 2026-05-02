import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkTheme = false;

  constructor() {
    const saved = localStorage.getItem('cr-theme');
    if (saved === 'dark') {
      this.darkTheme = true;
      document.body.classList.add('dark-theme');
    }
  }

  toggleTheme(): void {
    this.darkTheme = !this.darkTheme;
    document.body.classList.toggle('dark-theme', this.darkTheme);
    localStorage.setItem('cr-theme', this.darkTheme ? 'dark' : 'light');
  }

  isDarkTheme(): boolean {
    return this.darkTheme;
  }
}