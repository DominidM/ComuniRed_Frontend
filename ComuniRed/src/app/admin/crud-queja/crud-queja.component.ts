import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { QuejaService } from '../../services/queja.service';
// import { UsuarioService } from '../../services/usuario.service';
// import { EstadoQuejaService } from '../../services/estado-queja.service';

interface Queja {
  id: number;
  descripcion: string;
  fecha_creacion: string;
  usuario_id: number;
  usuario_nombre?: string;
  estado_id: number;
  estado_nombre?: string;
  imagen_url?: string;
}

interface Usuario {
  id: number;
  nombre: string;
}

interface EstadoQueja {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-crud-queja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-queja.component.html',
  styleUrls: ['./crud-queja.component.css']
})
export class CrudQuejaComponent implements OnInit {
  quejas: Queja[] = [];
  usuarios: Usuario[] = [];
  estados: EstadoQueja[] = [];
  showModal = false;
  editingQueja: Queja | null = null;
  quejaData: Partial<Queja> = {};

  // constructor(private quejaService: QuejaService, private usuarioService: UsuarioService, private estadoQuejaService: EstadoQuejaService) {}
  constructor() {}

  ngOnInit(): void {
    this.loadQuejas();
    this.loadUsuarios();
    this.loadEstados();
  }

  loadQuejas() {
    // this.quejaService.getQuejas().subscribe(data => { this.quejas = data; });
    this.quejas = [];
  }

  loadUsuarios() {
    // this.usuarioService.getUsuarios().subscribe(data => { this.usuarios = data; });
    this.usuarios = [];
  }

  loadEstados() {
    // this.estadoQuejaService.getEstados().subscribe(data => { this.estados = data; });
    this.estados = [];
  }

  openAddModal() {
    this.editingQueja = null;
    this.quejaData = {};
    this.showModal = true;
  }

  openEditModal(queja: Queja) {
    this.editingQueja = queja;
    this.quejaData = { ...queja };
    this.showModal = true;
  }

  saveQueja() {
    if (!this.quejaData.descripcion || !this.quejaData.usuario_id || !this.quejaData.estado_id) return;
    if (this.editingQueja) {
      // this.quejaService.updateQueja(this.editingQueja.id, this.quejaData).subscribe(() => this.loadQuejas());
    } else {
      // this.quejaService.createQueja(this.quejaData).subscribe(() => this.loadQuejas());
    }
    this.closeModal();
  }

  deleteQueja(queja: Queja) {
    if (confirm(`¿Seguro que deseas eliminar la queja #${queja.id}?`)) {
      // this.quejaService.deleteQueja(queja.id).subscribe(() => this.loadQuejas());
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingQueja = null;
    this.quejaData = {};
  }
}