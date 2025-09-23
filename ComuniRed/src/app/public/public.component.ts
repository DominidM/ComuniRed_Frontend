import { Component, HostListener } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RightbarComponent } from './rightbar/rightbar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-public',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
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
export class PublicComponent {
  isDesktop: boolean = true;

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isDesktop = window.innerWidth > 900;
  }
}
