import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-enviar-mensaje',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-message.component.html',
  styleUrls: ['./report-message.component.css']
})
export class EnviarMensajeComponent {
  @Input() reporte: any;
  @Output() cerrar = new EventEmitter<void>();
  
  @Output() mensajeEnviado = new EventEmitter<{ mensaje: string, estado?: string }>();

  mensaje: string = '';

  enviar() {
    if (!this.mensaje.trim()) return;

    // Emitimos el mensaje hacia el componente padre
    this.mensajeEnviado.emit({ mensaje: this.mensaje, estado: this.reporte.historial?.length ? this.reporte.historial[this.reporte.historial.length - 1].estado : 'enviado' });

    // Limpiamos el textarea
    this.mensaje = '';

    // Cerramos el modal de mensaje
    this.cerrar.emit();
  }
}
