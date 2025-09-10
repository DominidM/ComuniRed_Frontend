import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { EstadoQuejaService } from '../../services/estado-queja.service'; // Crea tu servicio real

interface EstadoQueja {
  id: number;
  nombre: string;
  descripcion?: string;
}

@Component({
  selector: 'app-crud-estado-queja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-estado-queja.component.html',
  styleUrls: ['./crud-estado-queja.component.css']
})
export class CrudEstadoQuejaComponent implements OnInit {
  estados: EstadoQueja[] = [];
  showModal = false;
  editingEstado: EstadoQueja | null = null;
  estadoData: Partial<EstadoQueja> = {};

  // constructor(private estadoQuejaService: EstadoQuejaService) {}
  constructor() {}

  ngOnInit(): void {
    this.loadEstados();
  }

  loadEstados() {
    // Ejemplo con tu servicio real:
    // this.estadoQuejaService.getEstados().subscribe(data => { this.estados = data; });
    // Demo:
    this.estados = [];
  }

  openAddModal() {
    this.editingEstado = null;
    this.estadoData = {};
    this.showModal = true;
  }

  openEditModal(estado: EstadoQueja) {
    this.editingEstado = estado;
    this.estadoData = { ...estado };
    this.showModal = true;
  }

  saveEstado() {
    if (!this.estadoData.nombre) return;
    if (this.editingEstado) {
      // Actualiza en tu API
      // this.estadoQuejaService.updateEstado(this.editingEstado.id, this.estadoData).subscribe(() => this.loadEstados());
    } else {
      // Inserta en tu API
      // this.estadoQuejaService.createEstado(this.estadoData).subscribe(() => this.loadEstados());
    }
    this.closeModal();
  }

  deleteEstado(estado: EstadoQueja) {
    if (confirm(`¿Seguro que deseas eliminar el estado "${estado.nombre}"?`)) {
      // this.estadoQuejaService.deleteEstado(estado.id).subscribe(() => this.loadEstados());
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingEstado = null;
    this.estadoData = {};
  }
}