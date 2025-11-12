import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConversacionService, Conversacion, Mensaje } from '../../services/conversacion.service';
import { UsuarioService, Usuario } from '../../services/usuario.service';
import { SeguimientoService } from '../../services/seguimiento.service';

interface ConversacionConUsuario extends Conversacion {
  otroUsuario?: Usuario;
  mensajesNoLeidos?: number;
}

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  usuarioActual: Usuario | null = null;
  conversaciones: ConversacionConUsuario[] = [];
  conversacionSeleccionada: ConversacionConUsuario | null = null;
  mensajes: Mensaje[] = [];
  usuarioChat: Usuario | null = null;
  nuevoMensaje: string = '';
  
  loadingConversaciones: boolean = false;
  loadingMensajes: boolean = false;
  enviandoMensaje: boolean = false;
  
  seSiguenMutuamente: boolean = true;
  
  private pollingInterval: any;
  private ultimoConteoMensajes: number = 0;
  private readonly DEFAULT_AVATAR = 'https://res.cloudinary.com/da4wxtjwu/image/upload/v1762842677/61e50034-ab7c-4dc5-9d75-7c27a2265cee.png';

  constructor(
    private conversacionService: ConversacionService,
    private usuarioService: UsuarioService,
    private seguimientoService: SeguimientoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.usuarioService.getUser();
    
    if (this.usuarioActual) {
      this.cargarConversaciones();
      
      setTimeout(() => {
        this.crearConversacionesConMutuos();
      }, 1500);
      
      this.iniciarPolling();
    }
  }

  ngOnDestroy(): void {
    this.detenerPolling();
  }

  iniciarPolling(): void {
    this.pollingInterval = setInterval(() => {
      if (this.conversacionSeleccionada) {
        this.actualizarMensajes();
        this.verificarEstadoSeguimiento();
        this.actualizarEstadoUsuarioChat();
      }
      this.actualizarConversaciones();
    }, 3000);
  }

  detenerPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  actualizarEstadoUsuarioChat(): void {
    if (!this.usuarioChat) return;

    this.usuarioService.obtenerUsuarioPorId(this.usuarioChat.id).subscribe({
      next: (usuario) => {
        this.usuarioChat = usuario;
      },
      error: (error) => {
        console.error('Error actualizando estado:', error);
      }
    });
  }

  cargarConversaciones(): void {
    if (!this.usuarioActual) {
      console.error('No hay usuario actual');
      return;
    }

    this.loadingConversaciones = true;

    this.conversacionService
      .misConversaciones(this.usuarioActual.id, 0, 50)
      .subscribe({
        next: (pageData) => {
          if (!pageData || !pageData.content || pageData.content.length === 0) {
            this.conversaciones = [];
            this.loadingConversaciones = false;
            return;
          }

          this.conversaciones = pageData.content.map(conv => ({ ...conv }));

          this.conversaciones.forEach(conv => {
            this.cargarInfoUsuarioConversacion(conv);
          });

          this.loadingConversaciones = false;
        },
        error: (error) => {
          console.error('Error cargando conversaciones:', error);
          this.loadingConversaciones = false;
        }
      });
  }

  cargarInfoUsuarioConversacion(conversacion: ConversacionConUsuario): void {
    if (!this.usuarioActual) return;

    const otroUsuarioId = conversacion.participante1Id === this.usuarioActual.id
      ? conversacion.participante2Id
      : conversacion.participante1Id;

    this.usuarioService.obtenerUsuarioPorId(otroUsuarioId).subscribe({
      next: (usuario) => {
        conversacion.otroUsuario = usuario;
      },
      error: (error) => {
        console.error('Error cargando usuario:', error);
        conversacion.otroUsuario = {
          id: otroUsuarioId,
          nombre: 'Usuario',
          apellido: 'Desconocido',
          email: ''
        } as Usuario;
      }
    });

    this.conversacionService
      .contarMensajesNoLeidos(conversacion.id, this.usuarioActual.id)
      .subscribe({
        next: (noLeidos) => {
          conversacion.mensajesNoLeidos = noLeidos || 0;
        },
        error: (error) => {
          console.error('Error contando mensajes:', error);
          conversacion.mensajesNoLeidos = 0;
        }
      });
  }

  actualizarConversaciones(): void {
    if (!this.usuarioActual || this.loadingConversaciones) return;

    this.conversacionService
      .misConversaciones(this.usuarioActual.id, 0, 50)
      .subscribe({
        next: async (pageData) => {
          for (let conv of pageData.content) {
            const existente = this.conversaciones.find(c => c.id === conv.id);
            
            if (existente) {
              const convClonada = { ...conv };
              
              existente.fechaUltimaActividad = convClonada.fechaUltimaActividad;
              existente.ultimoMensaje = convClonada.ultimoMensaje;
              
              if (this.conversacionSeleccionada?.id !== conv.id) {
                try {
                  const noLeidos = await this.conversacionService
                    .contarMensajesNoLeidos(conv.id, this.usuarioActual!.id)
                    .toPromise();
                  existente.mensajesNoLeidos = noLeidos;
                } catch (error) {
                  console.error('Error contando mensajes:', error);
                }
              }

              // 🆕 NUEVO: Actualizar estado del usuario
              if (existente.otroUsuario) {
                try {
                  const usuarioActualizado = await this.usuarioService
                    .obtenerUsuarioPorId(existente.otroUsuario.id)
                    .toPromise();
                  existente.otroUsuario = usuarioActualizado;
                } catch (error) {
                  console.error('Error actualizando usuario:', error);
                }
              }
            } else {
              const nuevaConv = { ...conv };
              this.conversaciones.unshift(nuevaConv);
              this.cargarInfoUsuarioConversacion(nuevaConv);
            }
          }
          
          this.conversaciones.sort((a, b) => 
            new Date(b.fechaUltimaActividad).getTime() - 
            new Date(a.fechaUltimaActividad).getTime()
          );
        },
        error: (error) => {
          console.error('Error actualizando conversaciones:', error);
        }
      });
  }

  async seleccionarConversacion(conversacion: ConversacionConUsuario): Promise<void> {
    this.conversacionSeleccionada = conversacion;
    this.usuarioChat = conversacion.otroUsuario || null;
    
    if (this.usuarioChat && this.usuarioActual) {
      this.seSiguenMutuamente = await this.verificarSeguimientoMutuo(
        this.usuarioActual.id, 
        this.usuarioChat.id
      );
      
      if (!this.seSiguenMutuamente) {
        console.log('Ya no se siguen mutuamente - Chat bloqueado');
      }
    }
    
    this.cargarMensajes();
    this.marcarComoLeido();
    conversacion.mensajesNoLeidos = 0;
  }

  async verificarEstadoSeguimiento(): Promise<void> {
    if (!this.usuarioChat || !this.usuarioActual) return;

    this.seSiguenMutuamente = await this.verificarSeguimientoMutuo(
      this.usuarioActual.id,
      this.usuarioChat.id
    );
  }

  async verificarSeguimientoMutuo(usuarioId1: string, usuarioId2: string): Promise<boolean> {
    try {
      const resultado = await this.conversacionService
        .seSiguenMutuamente(usuarioId1, usuarioId2)
        .toPromise();
      return resultado || false;
    } catch (error) {
      console.error('Error verificando seguimiento mutuo:', error);
      return false;
    }
  }

  cargarMensajes(): void {
    if (!this.conversacionSeleccionada) return;

    this.loadingMensajes = true;

    this.conversacionService
      .mensajesDeConversacion(this.conversacionSeleccionada.id, 0, 100)
      .subscribe({
        next: (pageData) => {
          this.mensajes = [...pageData.content].reverse();
          this.ultimoConteoMensajes = this.mensajes.length;
          this.loadingMensajes = false;
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('Error cargando mensajes:', error);
          this.loadingMensajes = false;
        }
      });
  }

  actualizarMensajes(): void {
    if (!this.conversacionSeleccionada || this.loadingMensajes) return;

    this.conversacionService
      .mensajesDeConversacion(this.conversacionSeleccionada.id, 0, 100)
      .subscribe({
        next: (pageData) => {
          const nuevosMensajes = [...pageData.content].reverse();
          
          if (nuevosMensajes.length !== this.ultimoConteoMensajes) {
            this.mensajes = nuevosMensajes;
            this.ultimoConteoMensajes = nuevosMensajes.length;
            this.scrollToBottom();
            this.marcarComoLeido();
          }
        },
        error: (error) => {
          console.error('Error actualizando mensajes:', error);
        }
      });
  }

  async enviarMensaje(): Promise<void> {
    if (!this.nuevoMensaje.trim() || !this.conversacionSeleccionada || !this.usuarioActual) {
      return;
    }

    if (!this.seSiguenMutuamente) {
      alert('No puedes enviar mensajes porque ya no se siguen mutuamente');
      return;
    }

    this.enviandoMensaje = true;
    const mensajeAEnviar = this.nuevoMensaje.trim();
    this.nuevoMensaje = '';

    this.conversacionService
      .enviarMensaje(this.conversacionSeleccionada.id, this.usuarioActual.id, mensajeAEnviar)
      .subscribe({
        next: (mensaje) => {
          this.mensajes.push(mensaje);
          this.ultimoConteoMensajes = this.mensajes.length;
          this.enviandoMensaje = false;
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('Error enviando mensaje:', error);
          this.nuevoMensaje = mensajeAEnviar;
          this.enviandoMensaje = false;
          alert('Error al enviar el mensaje. Puede que ya no se sigan mutuamente.');
        }
      });
  }

  marcarComoLeido(): void {
    if (!this.conversacionSeleccionada || !this.usuarioActual) return;

    this.conversacionService
      .marcarMensajesComoLeidos(this.conversacionSeleccionada.id, this.usuarioActual.id)
      .subscribe({
        next: () => {
          if (this.conversacionSeleccionada) {
            this.conversacionSeleccionada.mensajesNoLeidos = 0;
          }
        },
        error: (error) => {
          console.error('Error marcando como leídos:', error);
        }
      });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  esMiMensaje(mensaje: Mensaje): boolean {
    return this.usuarioActual?.id === mensaje.emisorId;
  }

  obtenerNombreUsuario(conversacion: ConversacionConUsuario): string {
    return conversacion.otroUsuario 
      ? `${conversacion.otroUsuario.nombre} ${conversacion.otroUsuario.apellido}`
      : 'Usuario';
  }

  estaEnLinea(usuario: Usuario | null | undefined): boolean {
    if (!usuario) return false;
    return this.usuarioService.estaEnLinea(usuario);
  }

  obtenerTextoEstado(usuario: Usuario | null | undefined): string {
    if (!usuario) return 'Desconectado';
    return this.usuarioService.obtenerTextoEstado(usuario);
  }

  obtenerUltimaActividad(usuario: Usuario | null | undefined): string {
    if (!usuario) return '';
    return this.usuarioService.obtenerUltimaActividad(usuario);
  }


  obtenerFoto(foto_perfil?: string): string {
    if (!foto_perfil || foto_perfil.trim() === '') {
      return this.DEFAULT_AVATAR;
    }
    
    if (this.usuarioService.esFotoCloudinary(foto_perfil)) {
      return this.usuarioService.obtenerFotoMiniatura(foto_perfil, 40);
    }
    
    return foto_perfil;
  }

  formatearHora(fecha: string): string {
    const date = new Date(fecha);
    const ahora = new Date();
    const diff = ahora.getTime() - date.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dias === 0) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (dias === 1) {
      return 'Ayer';
    } else if (dias < 7) {
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  }

  verPerfilUsuario(): void {
    if (this.usuarioChat) {
      this.router.navigate(['/user-profile', this.usuarioChat.id]);
    }
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  async crearConversacionesConMutuos(): Promise<void> {
    if (!this.usuarioActual) return;

    try {
      this.seguimientoService
        .obtenerSeguidos(this.usuarioActual.id, 0, 100)
        .subscribe({
          next: async (seguidos) => {
            if (!seguidos || !seguidos.content || seguidos.content.length === 0) {
              return;
            }

            for (const seguimiento of seguidos.content) {
              const otroUsuarioId = seguimiento.seguidoId;
              
              const esMutuo = await this.conversacionService
                .seSiguenMutuamente(this.usuarioActual!.id, otroUsuarioId)
                .toPromise();

              if (esMutuo) {
                try {
                  await this.conversacionService
                    .obtenerOCrearConversacion(this.usuarioActual!.id, otroUsuarioId)
                    .toPromise();
                } catch (error) {
                  console.error('Error creando conversación:', error);
                }
              }
            }

            setTimeout(() => {
              this.cargarConversaciones();
            }, 500);
          },
          error: (error) => {
            console.error('Error obteniendo seguidos:', error);
          }
        });

    } catch (error) {
      console.error('Error general:', error);
    }
  }
}
