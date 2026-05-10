import { Component, HostListener, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../layout/cliente/sidebar/sidebar.component';
import { RightbarComponent } from '../layout/cliente/rightbar/rightbar.component';
import { NavbarComponent } from '../layout/cliente/navbar/navbar.component';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
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
export class PublicComponent implements OnInit, AfterViewInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isDesktop = true;
  isReelsRoute = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkScreenSize();
    this.isReelsRoute = this.router.url.includes('/reels');

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isReelsRoute = e.url.includes('/reels');
      if (!this.isDesktop) this.sidenav.close();
    });
  }

  ngAfterViewInit() {
    if (!this.isDesktop) {
      this.sidenav.close();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
    if (this.sidenav) {
      this.isDesktop ? this.sidenav.open() : this.sidenav.close();
    }
  }

  checkScreenSize() {
    this.isDesktop = window.innerWidth > 768;
  }

  toggleSidenav() {
    this.sidenav.toggle();
  }

  get sidenavMode(): 'side' | 'over' {
    return this.isDesktop ? 'side' : 'over';
  }

  get sidenavOpened(): boolean {
    return this.isDesktop;
  }

  
}