import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../layout/cliente/sidebar/sidebar.component';
import { RightbarComponent } from './rightbar/rightbar.component';
import { NavbarComponent } from '../layout/cliente/navbar/navbar.component';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-public',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    RightbarComponent,
    NavbarComponent,
    RouterOutlet,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.css']
})
export class PublicComponent implements OnInit {
  isDesktop: boolean = true;
  isReelsRoute: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkScreenSize();

    // Check inicial por si se entra directo a /reels
    this.isReelsRoute = this.router.url.includes('/reels');

    // Escuchar cambios de ruta
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isReelsRoute = e.url.includes('/reels');
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isDesktop = window.innerWidth > 768;
  }

  get sidenavMode(): 'side' | 'over' {
    return this.isDesktop ? 'side' : 'over';
  }

  get sidenavOpened(): boolean {
    return this.isDesktop;
  }
}