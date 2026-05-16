import {
  Component,
  HostListener,
  OnInit,
  AfterViewInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../layout/cliente/sidebar/sidebar.component';
import { RightbarComponent } from '../layout/cliente/rightbar/rightbar.component';
import { NavbarComponent } from '../layout/cliente/navbar/navbar.component';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { filter, Subscription } from 'rxjs';
import { ModalStateService } from '../shared/services/modal-state.service';

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
    MatIconModule,
  ],
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.css'],
})
export class PublicComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isDesktop = true;
  isReelsRoute = false;
  isMessagesRoute = false;
  modalActive = false;

  private routerSub?: Subscription;
  private modalSub?: Subscription;

  constructor(
    private router: Router,
    private modalState: ModalStateService
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    this.isReelsRoute = this.router.url.includes('/reels');
    this.isMessagesRoute = this.router.url.includes('/messages');

    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.isReelsRoute = e.url.includes('/reels');
        this.isMessagesRoute = e.url.includes('/messages');
        if (!this.isDesktop && this.sidenav && !this.modalActive) {
          this.sidenav.close();
        }
      });

    this.modalSub = this.modalState.modalOpen$.subscribe((open) => {
      this.modalActive = open;

      if (open) {
        document.body.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
      }
    });
  }

  ngAfterViewInit() {
    if (!this.isDesktop) {
      this.sidenav.close();
    }
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.modalSub?.unsubscribe();
    document.body.classList.remove('modal-open');
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
    if (this.sidenav && !this.modalActive) {
      this.isDesktop ? this.sidenav.open() : this.sidenav.close();
    }
  }

  checkScreenSize() {
    this.isDesktop = window.innerWidth > 768;
  }

  toggleSidenav() {
    if (this.modalActive) return;
    this.sidenav.toggle();
  }

  get sidenavMode(): 'side' | 'over' {
    return this.isDesktop ? 'side' : 'over';
  }

  get sidenavOpened(): boolean {
    return this.isDesktop;
  }
}