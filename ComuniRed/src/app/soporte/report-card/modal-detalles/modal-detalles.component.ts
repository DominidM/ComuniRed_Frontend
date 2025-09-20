import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reporte } from '../../ajson/json';

@Component({
  selector: 'app-modal-detalles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-detalles.component.html',
  styleUrls: ['./modal-detalles.component.css']
})
export class ModalDetallesComponent {
  @Input() reporte!: Reporte;
  @Output() cerrar = new EventEmitter<void>();

  cerrarModal() {
    this.cerrar.emit();
  }
}
