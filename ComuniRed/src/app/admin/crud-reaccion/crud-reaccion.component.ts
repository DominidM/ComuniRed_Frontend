import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { ReaccionService } from '../../services/reaccion.service';
// import { UsuarioService } from '../../services/usuario.service';
// import { QuejaService } from '../../services/queja.service';
// import { TipoReaccionService } from '../../services/tipo-reaccion.service';

interface Reaccion {
  id: number;
  usuario_id: number;
  usuario_nombre?: string;
  queja_id: number;
  queja_descripcion?: string;
  tipo_reaccion_id: number;
  tipo_nombre?: string;
  tipo_icono?: string;
  fecha: string;
}

interface Usuario {
  id: number;
  nombre: string;
}

interface Queja {
  id: number;
  descripcion: string;
}

interface TipoReaccion {
  id: number;
  nombre: string;
  icono?: string;
}

@Component({
  selector: 'app-crud-reaccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-reaccion.component.html',
  styleUrls: ['./crud-reaccion.component.css']
})
export class CrudReaccionComponent implements OnInit {
  reacciones: Reaccion[] = [];
  usuarios: Usuario[] = [];
  quejas: Queja[] = [];
  tipos: TipoReaccion[] = [];
  showModal = false;
  editingReaccion: Reaccion | null = null;
  reaccionData: Partial<Reaccion> = {};

  // constructor(private reaccionService: ReaccionService, private usuarioService: UsuarioService, private quejaService: QuejaService, private tipoReaccionService: TipoReaccionService) {}
  constructor() {}

  ngOnInit(): void {
    this.loadReacciones();
    this.loadUsuarios();
    this.loadQuejas();
    this.loadTipos();
  }

  loadReacciones() {
    // this.reaccionService.getReacciones().subscribe(data => { this.reacciones = data; });
    this.reacciones = [];
  }

  loadUsuarios() {
    // this.usuarioService.getUsuarios().subscribe(data => { this.usuarios = data; });
    this.usuarios = [];
  }

  loadQuejas() {
    // this.quejaService.getQuejas().subscribe(data => { this.quejas = data; });
    this.quejas = [];
  }

  loadTipos() {
    // this.tipoReaccionService.getTipos().subscribe(data => { this.tipos = data; });
    this.tipos = [];
  }

  openAddModal() {
    this.editingReaccion = null;
    this.reaccionData = {};
    this.showModal = true;
  }

  openEditModal(reaccion: Reaccion) {
    this.editingReaccion = reaccion;
    this.reaccionData = { ...reaccion };
    this.showModal = true;
  }

  saveReaccion() {
    if (!this.reaccionData.usuario_id || !this.reaccionData.queja_id || !this.reaccionData.tipo_reaccion_id) return;
    if (this.editingReaccion) {
      // this.reaccionService.updateReaccion(this.editingReaccion.id, this.reaccionData).subscribe(() => this.loadReacciones());
    } else {
      // this.reaccionService.createReaccion(this.reaccionData).subscribe(() => this.loadReacciones());
    }
    this.closeModal();
  }

  deleteReaccion(reaccion: Reaccion) {
    if (confirm(`¿Seguro que deseas eliminar la reacción #${reaccion.id}?`)) {
      // this.reaccionService.deleteReaccion(reaccion.id).subscribe(() => this.loadReacciones());
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingReaccion = null;
    this.reaccionData = {};
  }

  isUrl(valor: string | undefined): boolean {
    if (!valor) return false;
    return valor.startsWith('http://') || valor.startsWith('https://');
  }
}
