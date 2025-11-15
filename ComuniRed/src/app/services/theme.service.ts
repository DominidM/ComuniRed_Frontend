import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkTheme = false;

  toggleTheme(): void {
    this.darkTheme = !this.darkTheme;
    const classList = document.documentElement.classList;
    this.darkTheme ? classList.add('dark-theme') : classList.remove('dark-theme');
  }

  isDarkTheme(): boolean {
    return this.darkTheme;
  }
}