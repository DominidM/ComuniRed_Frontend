import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { TipoReaccionService } from '../../services/tipo-reaccion.service'; // Crea tu servicio real

interface TipoReaccion {
  id: number;
  nombre: string;
  icono?: string;
}

@Component({
  selector: 'app-crud-tipo-reaccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-tipo-reaccion.component.html',
  styleUrls: ['./crud-tipo-reaccion.component.css']
})
export class CrudTipoReaccionComponent implements OnInit {
  tipos: TipoReaccion[] = [];
  showModal = false;
  editingTipo: TipoReaccion | null = null;
  tipoData: Partial<TipoReaccion> = {};

  // constructor(private tipoReaccionService: TipoReaccionService) {}
  constructor() {}

  ngOnInit(): void {
    this.loadTipos();
  }

  loadTipos() {
    // this.tipoReaccionService.getTipos().subscribe(data => { this.tipos = data; });
    this.tipos = [];
  }

  openAddModal() {
    this.editingTipo = null;
    this.tipoData = {};
    this.showModal = true;
  }

  openEditModal(tipo: TipoReaccion) {
    this.editingTipo = tipo;
    this.tipoData = { ...tipo };
    this.showModal = true;
  }

  saveTipo() {
    if (!this.tipoData.nombre) return;
    if (this.editingTipo) {
      // this.tipoReaccionService.updateTipo(this.editingTipo.id, this.tipoData).subscribe(() => this.loadTipos());
    } else {
      // this.tipoReaccionService.createTipo(this.tipoData).subscribe(() => this.loadTipos());
    }
    this.closeModal();
  }

  deleteTipo(tipo: TipoReaccion) {
    if (confirm(`¿Seguro que deseas eliminar el tipo "${tipo.nombre}"?`)) {
      // this.tipoReaccionService.deleteTipo(tipo.id).subscribe(() => this.loadTipos());
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingTipo = null;
    this.tipoData = {};
  }

  isUrl(valor: string | undefined): boolean {
    if (!valor) return false;
    return valor.startsWith('http://') || valor.startsWith('https://');
  }
}