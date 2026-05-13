import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { UsuarioService } from '../services/usuario.service';
import { ThemeService } from '../services/theme.service';

import { AdminNavbarComponent } from '../layout/admin/admin-navbar/admin-navbar.component';
import { AdminSidebarComponent } from '../layout/admin/admin-sidebar/admin-sidebar.component';
  
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
    RouterModule,
    AdminNavbarComponent,
    AdminSidebarComponent
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatMessagesDiv') chatMessagesElement!: ElementRef<HTMLDivElement>;
  @ViewChild('chatInput') chatInputElement!: ElementRef<HTMLInputElement>;

  chatbotOpen = false;
  chatMessage = '';
  chatMessages: ChatMessage[] = [];
  private shouldScrollToBottom = false;

  isDarkMode = false;

  private readonly botResponses = [
    'Gracias por tu mensaje. ¿En qué más puedo ayudarte?',
    'Entiendo tu consulta. Te recomiendo revisar la sección correspondiente en el menú.',
    '¡Excelente pregunta! Para más información específica, contacta al administrador.',
    'He registrado tu solicitud. ¿Hay algo más en lo que pueda asistirte?',
    'Para problemas técnicos, por favor revisa la documentación o contacta soporte.',
    'Tu consulta es importante. ¿Podrías darme más detalles?',
    '¡Perfecto! ¿Necesitas ayuda con alguna otra funcionalidad del sistema?'
  ];

  private windowStorageListener = (e: StorageEvent) => this.onStorageEvent(e);

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    window.addEventListener('storage', this.windowStorageListener);
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.windowStorageListener);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  get userDisplay(): string {
    const u = this.usuarioService.getUser();
    if (!u) return 'Invitado';

    const nombre = (u as any).nombre ?? '';
    const apellido = (u as any).apellido ?? '';
    const email = (u as any).email ?? '';

    return (nombre || apellido) ? `${nombre} ${apellido}`.trim() : email;
  }

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

  logout(): void {
    this.usuarioService.logout();
    this.chatbotOpen = false;
    this.router.navigate(['/login']);
  }

  exportPdf(): void {
    this.router.navigate(['/admin/report-export']);
  }

  toggleChatbot(): void {
    this.chatbotOpen = !this.chatbotOpen;

    if (this.chatbotOpen) {
      setTimeout(() => {
        try {
          this.chatInputElement?.nativeElement.focus();
        } catch {}
      }, 250);
    }
  }

  closeChatbot(): void {
    this.chatbotOpen = false;
  }

  sendMessage(): void {
    const message = this.chatMessage.trim();
    if (!message) return;

    this.chatMessages.push({
      content: message,
      isUser: true,
      timestamp: new Date()
    });

    this.chatMessage = '';
    this.shouldScrollToBottom = true;

    setTimeout(() => {
      const botResponse = this.generateBotResponse(message);

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
      return 'Para gestionar usuarios, dirígete a la sección "Usuarios" del menú lateral.';
    }

    if (message.includes('queja') || message.includes('reporte')) {
      return 'Las quejas se gestionan desde la sección "Quejas" y sus estados desde "Estados de Queja".';
    }

    if (message.includes('rol') || message.includes('permiso')) {
      return 'Los roles y permisos se administran desde la sección "Roles".';
    }

    if (message.includes('export') || message.includes('pdf') || message.includes('csv')) {
      return 'Puedes generar reportes desde el botón "Exportar reporte PDF" en el menú lateral.';
    }

    if (message.includes('ayuda') || message.includes('help')) {
      return 'Estoy aquí para ayudarte. ¿Sobre qué módulo necesitas información?';
    }

    if (message.includes('hola') || message.includes('buenos dias') || message.includes('buenas tardes')) {
      return '¡Hola! ¿En qué puedo ayudarte hoy?';
    }

    if (message.includes('gracias')) {
      return '¡De nada! Si tienes otra consulta, aquí estaré.';
    }

    if (message.includes('adios') || message.includes('hasta luego')) {
      return '¡Hasta luego! Que tengas un excelente día.';
    }

    return this.botResponses[Math.floor(Math.random() * this.botResponses.length)];
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatMessagesElement?.nativeElement;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }

  private onStorageEvent(e: StorageEvent): void {
    if (!e || e.key === null) return;

    if (e.key === 'comunired_user' || e.key === 'comunired_token') {
      this.isDarkMode = this.themeService.isDarkTheme();
    }
  }
}