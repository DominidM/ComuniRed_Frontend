import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-ubicacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-ubicacion.component.html',
  styleUrls: ['./modal-ubicacion.component.css']
})
export class ModalUbicacionComponent {
  @Input() ubicacion!: string;
  @Output() cerrar = new EventEmitter<void>();

  cerrarModal() {
    this.cerrar.emit();
  }
}
