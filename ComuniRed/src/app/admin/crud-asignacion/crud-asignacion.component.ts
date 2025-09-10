import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { AsignacionService } from '../../services/asignacion.service';
// import { QuejaService } from '../../services/queja.service';
// import { UsuarioService } from '../../services/usuario.service';

interface Asignacion {
  id: number;
  queja_id: number;
  soporte_id: number;
  fecha_asignacion: string;
  atendida: boolean;
  queja_descripcion?: string;
  soporte_nombre?: string;
}

interface Queja {
  id: number;
  descripcion: string;
}

interface Usuario {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-crud-asignacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-asignacion.component.html',
  styleUrls: ['./crud-asignacion.component.css']
})
export class CrudAsignacionComponent implements OnInit {
  asignaciones: Asignacion[] = [];
  quejas: Queja[] = [];
  soportes: Usuario[] = [];
  showModal = false;
  editingAsignacion: Asignacion | null = null;
  asignacionData: Partial<Asignacion> = {};

  // constructor(private asignacionService: AsignacionService, private quejaService: QuejaService, private usuarioService: UsuarioService) {}
  constructor() {}

  ngOnInit(): void {
    this.loadAsignaciones();
    this.loadQuejas();
    this.loadSoportes();
  }

  loadAsignaciones() {
    // this.asignacionService.getAsignaciones().subscribe(data => { this.asignaciones = data; });
    this.asignaciones = [];
  }

  loadQuejas() {
    // this.quejaService.getQuejas().subscribe(data => { this.quejas = data; });
    this.quejas = [];
  }

  loadSoportes() {
    // this.usuarioService.getSoportes().subscribe(data => { this.soportes = data; });
    this.soportes = [];
  }

  openAddModal() {
    this.editingAsignacion = null;
    this.asignacionData = { atendida: false };
    this.showModal = true;
  }

  openEditModal(asignacion: Asignacion) {
    this.editingAsignacion = asignacion;
    this.asignacionData = { ...asignacion };
    this.showModal = true;
  }

  saveAsignacion() {
    if (!this.asignacionData.queja_id || !this.asignacionData.soporte_id) return;
    if (this.editingAsignacion) {
      // this.asignacionService.updateAsignacion(this.editingAsignacion.id, this.asignacionData).subscribe(() => this.loadAsignaciones());
    } else {
      // this.asignacionService.createAsignacion(this.asignacionData).subscribe(() => this.loadAsignaciones());
    }
    this.closeModal();
  }

  deleteAsignacion(asignacion: Asignacion) {
    if (confirm(`¿Seguro que deseas eliminar la asignación #${asignacion.id}?`)) {
      // this.asignacionService.deleteAsignacion(asignacion.id).subscribe(() => this.loadAsignaciones());
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingAsignacion = null;
    this.asignacionData = {};
  }
}