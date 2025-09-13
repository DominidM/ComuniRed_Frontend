import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
}

@Component({
  selector: 'app-crud-rol',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-rol.component.html',
  styleUrls: ['./crud-rol.component.css']
})
export class CrudRolComponent {
  roles: Rol[] = [
    { id: 1, nombre: 'Administrador', descripcion: 'Acceso total al sistema' },
    { id: 2, nombre: 'Usuario', descripcion: 'Acceso limitado' },
    { id: 3, nombre: 'Soporte', descripcion: 'Acceso ilimitado' },

  ];

  showModal = false;
  editingRol: Rol | null = null;
  rolData: Partial<Rol> = {};

  openAddModal() {
    this.editingRol = null;
    this.rolData = {};
    this.showModal = true;
  }

  openEditModal(rol: Rol) {
    this.editingRol = rol;
    this.rolData = { ...rol };
    this.showModal = true;
  }

  saveRol() {
    if (!this.rolData.nombre) return;

    if (this.editingRol) {
      // Editar existente
      const idx = this.roles.findIndex(r => r.id === this.editingRol!.id);
      if (idx >= 0) {
        this.roles[idx] = { ...this.editingRol, ...this.rolData } as Rol;
      }
    } else {
      // Nuevo rol
      const newId = this.roles.length > 0 ? Math.max(...this.roles.map(r => r.id)) + 1 : 1;
      this.roles.push({
        id: newId,
        nombre: this.rolData.nombre!,
        descripcion: this.rolData.descripcion || ''
      });
    }
    this.closeModal();
  }

  deleteRol(rol: Rol) {
    if (confirm(`¿Seguro que deseas eliminar el rol "${rol.nombre}"?`)) {
      this.roles = this.roles.filter(r => r.id !== rol.id);
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingRol = null;
    this.rolData = {};
  }
}