import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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
export class AdminComponent implements AfterViewChecked {
  @ViewChild('chatMessagesDiv') chatMessagesElement!: ElementRef;
  @ViewChild('chatInput') chatInputElement!: ElementRef;

  userEmail = 'dominidm@gmail.com';
  chatbotOpen = false;
  chatMessage = '';
  chatMessages: ChatMessage[] = [];
  private shouldScrollToBottom = false;

  private botResponses = [
    'Gracias por tu mensaje. ¿En qué más puedo ayudarte?',
    'Entiendo tu consulta. Te recomiendo revisar la sección correspondiente en el menú.',
    '¡Excelente pregunta! Para más información específica, contacta al administrador.',
    'He registrado tu solicitud. ¿Hay algo más en lo que pueda asistirte?',
    'Para problemas técnicos, por favor revisa la documentación o contacta soporte.',
    'Tu consulta es importante. ¿Podrías darme más detalles?',
    '¡Perfecto! ¿Necesitas ayuda con alguna otra funcionalidad del sistema?'
  ];

  constructor(private router: Router) {}

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  logout() {
    this.router.navigate(['/login']);
  }

  toggleChatbot() {
    this.chatbotOpen = !this.chatbotOpen;
    if (this.chatbotOpen) {
      setTimeout(() => {
        if (this.chatInputElement) {
          this.chatInputElement.nativeElement.focus();
        }
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
    }, 1000 + Math.random() * 1000);
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
      this.chatMessagesElement.nativeElement.scrollTop = this.chatMessagesElement.nativeElement.scrollHeight;
    } catch (err) { }
  }
}