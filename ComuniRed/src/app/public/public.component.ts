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
import { filter, Subscription, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ModalStateService, CreateStoryUser } from '../shared/services/modal-state.service';
import { CrearHistoriaComponent } from './feed/stories/crear-historia/crear-historia.component';
import { ConversacionService, Conversacion, Mensaje } from '../services/conversacion.service';
import { UsuarioService } from '../services/usuario.service';
import { SeguimientoService } from '../services/seguimiento.service';

interface ChatWindow {
  convId: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  initials: string;
  color: string;
  minimized: boolean;
  loading: boolean;
  messages: Mensaje[];
  newMessage: string;
  sending: boolean;
  canSend: boolean;
}

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
    CrearHistoriaComponent,
  ],
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.css'],
})
export class PublicComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isDesktop = true;
  isReelsRoute = false;
  isMessagesRoute = false;
  isSuggestionsRoute = false;
  modalActive = false;

  showCreateStory = false;
  createStoryUser: CreateStoryUser | null = null;

  showChatPanel = false;
  showNewChat = false;
  chats: any[] = [];
  loadingChats = false;
  mutuos: any[] = [];
  loadingMutuos = false;
  chatWindows: ChatWindow[] = [];
  private currentUserId = '';
  private currentUserAvatar = '';
  private currentUserName = '';

  private readonly COLORS = [
    'linear-gradient(135deg,#667eea,#764ba2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#fa709a,#fee140)',
  ];

  private routerSub?: Subscription;
  private modalSub?: Subscription;
  private createStorySub?: Subscription;

  constructor(
    private router: Router,
    private modalState: ModalStateService,
    private conversacionService: ConversacionService,
    private usuarioService: UsuarioService,
    private seguimientoService: SeguimientoService,
  ) {
    const u = this.usuarioService.getUser() as any;
    if (u) {
      this.currentUserId = u.id || u._id;
      this.currentUserAvatar = this.usuarioService.obtenerFotoMiniatura(u.foto_perfil, 36);
      this.currentUserName = `${u.nombre || ''} ${u.apellido || ''}`.trim();
    }
  }

  ngOnInit() {
    this.checkScreenSize();
    this.isReelsRoute = this.router.url.includes('/reels');
    this.isMessagesRoute = this.router.url.includes('/messages');
    this.isSuggestionsRoute = this.router.url.includes('/suggestions');

    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.isReelsRoute = e.url.includes('/reels');
        this.isMessagesRoute = e.url.includes('/messages');
        this.isSuggestionsRoute = e.url.includes('/suggestions');
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

    this.createStorySub = this.modalState.createStoryUser$.subscribe((user) => {
      this.showCreateStory = !!user;
      this.createStoryUser = user;
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
    this.createStorySub?.unsubscribe();
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

  closeCreateStoryModal(): void {
    this.modalState.closeCreateStory();
  }

  onStoryCreated(story: any): void {
    this.modalState.closeCreateStory();
    this.modalState.emitStoryCreated(story);
  }

  toggleChatPanel(): void {
    this.showChatPanel = !this.showChatPanel;
    if (this.showChatPanel) this.cargarConversaciones();
  }

  private cargarConversaciones(): void {
    if (!this.currentUserId) return;
    this.loadingChats = true;
    this.conversacionService.misConversaciones(this.currentUserId, 0, 20).subscribe({
      next: (page) => {
        const reqs = page.content.map((conv, i) => {
          const otroId = conv.participante1Id === this.currentUserId ? conv.participante2Id : conv.participante1Id;
          return this.usuarioService.obtenerUsuarioPorId(otroId).pipe(
            catchError(() => of(null)),
            map((usuario) => this.mapearChat(conv, i, usuario)),
          );
        });
        forkJoin(reqs).subscribe({
          next: (chats) => {
            this.chats = chats.filter(c => c);
            this.loadingChats = false;
          },
          error: () => { this.loadingChats = false; },
        });
      },
      error: () => { this.loadingChats = false; },
    });
  }

  private mapearChat(conv: Conversacion, index: number, usuario: any): any {
    const otroId = conv.participante1Id === this.currentUserId ? conv.participante2Id : conv.participante1Id;
    const unread = conv.ultimoMensaje ? !conv.ultimoMensaje.leido && conv.ultimoMensaje.emisorId !== this.currentUserId : false;
    const nombre = usuario ? `${usuario.nombre} ${usuario.apellido}`.trim() : otroId;
    const initials = usuario ? `${usuario.nombre?.[0] ?? ''}${usuario.apellido?.[0] ?? ''}`.toUpperCase() : '??';
    return {
      id: otroId,
      convId: conv.id,
      name: nombre,
      initials,
      color: usuario?.foto_perfil ? '' : this.COLORS[index % this.COLORS.length],
      avatarUrl: usuario ? this.usuarioService.obtenerFotoMiniatura(usuario.foto_perfil, 44) : null,
      preview: conv.ultimoMensaje?.contenido || '',
      time: this.formatearFecha(conv.fechaUltimaActividad),
      unread,
    };
  }

  private formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const diff = (Date.now() - new Date(fecha).getTime()) / 1000;
    if (diff < 60) return 'ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }

  abrirChat(chat: any): void {
    this.showChatPanel = false;
    const exist = this.chatWindows.find(w => w.convId === chat.convId);
    if (exist) {
      exist.minimized = false;
      this.chatWindows = [...this.chatWindows];
      return;
    }
    const w: ChatWindow = {
      convId: chat.convId,
      userId: chat.id,
      name: chat.name,
      avatarUrl: chat.avatarUrl,
      initials: chat.initials,
      color: chat.color,
      minimized: false,
      loading: true,
      messages: [],
      newMessage: '',
      sending: false,
      canSend: true,
    };
    this.chatWindows = [...this.chatWindows, w];
    this.cargarMensajesVentana(w);
  }

  toggleMinWindow(w: ChatWindow): void {
    w.minimized = !w.minimized;
    this.chatWindows = [...this.chatWindows];
    if (!w.minimized && w.messages.length === 0) this.cargarMensajesVentana(w);
  }

  closeChatWindow(w: ChatWindow): void {
    this.chatWindows = this.chatWindows.filter(x => x !== w);
  }

  private cargarMensajesVentana(w: ChatWindow): void {
    w.loading = true;
    this.conversacionService.mensajesDeConversacion(w.convId, 0, 50).subscribe({
      next: (page) => {
        w.messages = [...page.content].reverse();
        w.loading = false;
        this.chatWindows = [...this.chatWindows];
        this.marcarLeidos(w);
        this.verificarMutuo(w);
      },
      error: () => { w.loading = false; this.chatWindows = [...this.chatWindows]; },
    });
  }

  private verificarMutuo(w: ChatWindow): void {
    this.conversacionService.seSiguenMutuamente(this.currentUserId, w.userId).subscribe({
      next: (mutuo) => { w.canSend = mutuo; this.chatWindows = [...this.chatWindows]; },
      error: () => { w.canSend = false; this.chatWindows = [...this.chatWindows]; },
    });
  }

  private marcarLeidos(w: ChatWindow): void {
    this.conversacionService.marcarMensajesComoLeidos(w.convId, this.currentUserId).subscribe();
  }

  enviarMsgWindow(w: ChatWindow): void {
    const text = w.newMessage.trim();
    if (!text || w.sending || !w.canSend) return;
    w.sending = true;
    w.newMessage = '';
    this.conversacionService.enviarMensaje(w.convId, this.currentUserId, text).subscribe({
      next: (msg) => {
        w.messages.push(msg);
        w.sending = false;
        this.chatWindows = [...this.chatWindows];
      },
      error: () => { w.sending = false; this.chatWindows = [...this.chatWindows]; },
    });
  }

  esMiMsg(msg: Mensaje): boolean {
    return msg.emisorId === this.currentUserId;
  }

  trackByMsgId(_: number, msg: Mensaje): string {
    return msg.id;
  }

  trackByWindow(_: number, w: ChatWindow): string {
    return w.convId;
  }

  toggleNewChat(): void {
    this.showNewChat = !this.showNewChat;
    if (this.showNewChat) this.cargarMutuos();
  }

  private cargarMutuos(): void {
    if (!this.currentUserId) return;
    this.loadingMutuos = true;
    this.seguimientoService.obtenerSeguidos(this.currentUserId, 0, 50).subscribe({
      next: (page) => {
        const ids = page.content.filter(s => s.estado === 'ACEPTADO').map(s => s.seguidoId);
        if (ids.length === 0) { this.mutuos = []; this.loadingMutuos = false; return; }
        const checks = ids.map(id =>
          this.seguimientoService.obtenerEstadoSeguimiento(this.currentUserId, id).pipe(
            switchMap(estado => {
              if (!estado.seguimientoMutuo) return of(null);
              return this.usuarioService.obtenerUsuarioPorId(id).pipe(
                map(u => u ? {
                  id: u.id,
                  name: `${u.nombre || ''} ${u.apellido || ''}`.trim(),
                  avatarUrl: this.usuarioService.obtenerFotoMiniatura(u.foto_perfil, 44),
                } : null),
                catchError(() => of(null)),
              );
            }),
            catchError(() => of(null)),
          )
        );
        forkJoin(checks).subscribe({
          next: (res) => { this.mutuos = res.filter(r => r); this.loadingMutuos = false; },
          error: () => { this.loadingMutuos = false; },
        });
      },
      error: () => { this.loadingMutuos = false; },
    });
  }

  iniciarChat(user: any): void {
    this.showNewChat = false;
    if (!this.currentUserId) return;
    this.conversacionService.obtenerOCrearConversacion(this.currentUserId, user.id).subscribe({
      next: (conv) => {
        const exist = this.chatWindows.find(w => w.convId === conv.id);
        if (exist) { exist.minimized = false; this.chatWindows = [...this.chatWindows]; return; }
        const w: ChatWindow = {
          convId: conv.id,
          userId: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          initials: user.name.split(' ').map((s: string) => s[0]).join('').toUpperCase().slice(0, 2) || '??',
          color: '',
          minimized: false,
          loading: true,
          messages: [],
          newMessage: '',
          sending: false,
          canSend: true,
        };
        this.chatWindows = [...this.chatWindows, w];
        this.cargarMensajesVentana(w);
      },
    });
  }

  nuevoMensaje(): void {
    this.showChatPanel = false;
    this.router.navigate(['/public/messages']);
  }
}