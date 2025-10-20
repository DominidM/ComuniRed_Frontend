import { Component, ViewChild, ElementRef, AfterViewChecked, AfterViewInit, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatMessagesDiv') chatMessagesElement!: ElementRef<HTMLDivElement>;
  @ViewChild('chatInput') chatInputElement!: ElementRef<HTMLInputElement>;

  chatbotOpen = false;
  chatMessage = '';
  chatMessages: ChatMessage[] = [];
  private shouldScrollToBottom = false;

  // Gestión DB and tools toggles
  gestionOpen = false;
  toolsOpen = false;

  private botResponses = [
    'Gracias por tu mensaje. ¿En qué más puedo ayudarte?',
    'Entiendo tu consulta. Te recomiendo revisar la sección correspondiente en el menú.',
    '¡Excelente pregunta! Para más información específica, contacta al administrador.',
    'He registrado tu solicitud. ¿Hay algo más en lo que pueda asistirte?',
    'Para problemas técnicos, por favor revisa la documentación o contacta soporte.',
    'Tu consulta es importante. ¿Podrías darme más detalles?',
    '¡Perfecto! ¿Necesitas ayuda con alguna otra funcionalidad del sistema?'
  ];

  // reference to the nested group-list element used for animated collapse
  private groupListEl: HTMLElement | null = null;
  private toolsListEl: HTMLElement | null = null;
  private windowStorageListener = (e: StorageEvent) => this.onStorageEvent(e);

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private renderer: Renderer2,
    private host: ElementRef
  ) {}

  ngOnInit(): void {
    // listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', this.windowStorageListener);
  }

  ngAfterViewInit(): void {
    // lazy-query the lists for animation control
    this.groupListEl = this.host.nativeElement.querySelector('.menu-group .group-list');
    this.toolsListEl = this.host.nativeElement.querySelectorAll('.menu-group')[1]?.querySelector('.group-list') || null;

    // if initial state open, set maxHeight to show smoothly
    if (this.gestionOpen && this.groupListEl) {
      this.renderer.setStyle(this.groupListEl, 'maxHeight', `${this.groupListEl.scrollHeight}px`);
      setTimeout(() => {
        try { this.renderer.setStyle(this.groupListEl, 'maxHeight', 'none'); } catch {}
      }, 350);
    }
    if (this.toolsOpen && this.toolsListEl) {
      this.renderer.setStyle(this.toolsListEl, 'maxHeight', `${this.toolsListEl.scrollHeight}px`);
      setTimeout(() => {
        try { this.renderer.setStyle(this.toolsListEl, 'maxHeight', 'none'); } catch {}
      }, 350);
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.windowStorageListener);
  }

  // Mostrar el email o nombre del usuario guardado en localStorage por UsuarioService
  get userDisplay(): string {
    const u = this.usuarioService.getUser();
    if (!u) return 'Invitado';
    const nombre = (u as any).nombre ?? '';
    const apellido = (u as any).apellido ?? '';
    const email = (u as any).email ?? '';
    return (nombre || apellido) ? `${nombre} ${apellido}`.trim() : email;
  }

  // ROL checks (ajusta si usas ids o nombres diferentes)
  private rolesCache(): string[] {
    return this.usuarioService.getRoles() || [];
  }

  get isAdmin(): boolean {
    const roles = this.rolesCache();
    return roles.some(r =>
      String(r).toLowerCase().includes('admin') ||
      String(r).toLowerCase() === 'rol_admin' ||
      String(r) === '68ca68c40bc4d9ca3267b667'
    );
  }

  get isSoporte(): boolean {
    const roles = this.rolesCache();
    return roles.some(r =>
      /soporte|support/i.test(String(r)) ||
      String(r) === '68ca68bb0bc4d9ca3267b665'
    );
  }

  // Toggle Gestión DB with simple CSS max-height animation
  toggleGestion() {
    this.gestionOpen = !this.gestionOpen;
    this.animateList(this.groupListEl, this.gestionOpen);
  }

  // Toggle Tools group
  toggleTools() {
    this.toolsOpen = !this.toolsOpen;
    this.animateList(this.toolsListEl, this.toolsOpen);
  }

  private animateList(el: HTMLElement | null, open: boolean) {
    if (!el) {
      // attempt to query again if not yet available
      el = this.host.nativeElement.querySelector('.menu-group .group-list');
      if (!el) return;
    }

    if (open) {
      const sh = el.scrollHeight;
      this.renderer.setStyle(el, 'maxHeight', `${sh}px`);
      this.renderer.setStyle(el, 'opacity', `1`);
      this.renderer.setStyle(el, 'transform', `translateY(0)`);
      setTimeout(() => {
        try { this.renderer.setStyle(el, 'maxHeight', 'none'); } catch {}
      }, 350);
    } else {
      const current = el.scrollHeight;
      this.renderer.setStyle(el, 'maxHeight', `${current}px`);
      // force reflow
      // tslint:disable-next-line:no-unused-expression
      el.offsetHeight;
      this.renderer.setStyle(el, 'maxHeight', '0px');
      this.renderer.setStyle(el, 'opacity', '0');
      this.renderer.setStyle(el, 'transform', 'translateY(-6px)');
    }
  }

  // Logout usando UsuarioService para limpiar token + Apollo cache
  logout() {
    this.usuarioService.logout();
    this.chatbotOpen = false;
    // close admin-only menus
    this.gestionOpen = false;
    this.toolsOpen = false;
    try {
      if (this.groupListEl) {
        this.renderer.setStyle(this.groupListEl, 'maxHeight', '0px');
        this.renderer.setStyle(this.groupListEl, 'opacity', '0');
      }
      if (this.toolsListEl) {
        this.renderer.setStyle(this.toolsListEl, 'maxHeight', '0px');
        this.renderer.setStyle(this.toolsListEl, 'opacity', '0');
      }
    } catch {}
    this.router.navigate(['/login']);
  }

  toggleChatbot() {
    this.chatbotOpen = !this.chatbotOpen;
    if (this.chatbotOpen) {
      setTimeout(() => {
        try {
          this.chatInputElement?.nativeElement.focus();
        } catch { /* ignore */ }
      }, 300);
    }
  }

  closeChatbot() {
    this.chatbotOpen = false;
  }

  sendMessage() {
    if (this.chatMessage.trim() === '') return;
    this.chatMessages.push({
      content: this.chatMessage,
      isUser: true,
      timestamp: new Date()
    });
    const userMessage = this.chatMessage;
    this.chatMessage = '';
    this.shouldScrollToBottom = true;
    setTimeout(() => {
      const botResponse = this.generateBotResponse(userMessage);
      this.chatMessages.push({
        content: botResponse,
        isUser: false,
        timestamp: new Date()
      });
      this.shouldScrollToBottom = true;
    }, 800 + Math.random() * 800);
  }

  private generateBotResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    if (message.includes('usuario') || message.includes('user')) {
      return 'Para gestionar usuarios, dirígete a la sección "Gestión Usuarios" en el menú lateral.';
    }
    if (message.includes('queja') || message.includes('reporte')) {
      return 'Las quejas se pueden gestionar desde "Gestión Quejas". También puedes revisar los estados en "Gestión Estados Queja".';
    }
    if (message.includes('rol') || message.includes('permiso')) {
      return 'Los roles y permisos se configuran en la sección "Gestión Roles".';
    }
    if (message.includes('export') || message.includes('pdf') || message.includes('csv')) {
      return 'Puedes generar reportes desde Exportar / Generar PDFs o Exportar CSV en el menú.';
    }
    if (message.includes('ayuda') || message.includes('help')) {
      return 'Estoy aquí para ayudarte. ¿Sobre qué tema necesitas información?';
    }
    if (message.includes('hola') || message.includes('buenos dias') || message.includes('buenas tardes')) {
      return '¡Hola! ¿En qué puedo ayudarte hoy?';
    }
    if (message.includes('gracias') || message.includes('muchas gracias')) {
      return '¡De nada! Si tienes más preguntas, no dudes en preguntar.';
    }
    if (message.includes('adios') || message.includes('hasta luego')) {
      return '¡Hasta luego! Que tengas un buen día.';
    }
    return this.botResponses[Math.floor(Math.random() * this.botResponses.length)];
  }

  private scrollToBottom() {
    try {
      const el = this.chatMessagesElement?.nativeElement;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    } catch (err) { /* ignore */ }
  }

  // optional: reacts to storage changes (login/logout in another tab)
  private onStorageEvent(e: StorageEvent) {
    if (!e) return;
    if (e.key === null) return;
    if (e.key === 'comunired_user' || e.key === 'comunired_token') {
      // refresh element refs in case DOM changed or roles changed
      setTimeout(() => {
        this.groupListEl = this.host.nativeElement.querySelector('.menu-group .group-list');
        this.toolsListEl = this.host.nativeElement.querySelectorAll('.menu-group')[1]?.querySelector('.group-list') || null;
      }, 50);
    }
  }

  exportPdf(): void {
    // Navigate to the export/report page (adjust route if different)
    this.router.navigate(['/admin/reporte-export']);
  }
}