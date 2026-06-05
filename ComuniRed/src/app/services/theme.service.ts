import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkTheme = false;

  constructor() {
    const saved = localStorage.getItem('cr-theme');
    const theme = saved === 'dark' ? 'dark' : 'light';
    this.darkTheme = theme === 'dark';
    document.body.classList.toggle('dark-theme', this.darkTheme);
    document.body.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark-theme', this.darkTheme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme(): void {
    this.darkTheme = !this.darkTheme;
    const theme = this.darkTheme ? 'dark' : 'light';
    document.body.classList.toggle('dark-theme', this.darkTheme);
    document.body.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark-theme', this.darkTheme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cr-theme', theme);
  }

  isDarkTheme(): boolean {
    return this.darkTheme;
  }
}
