import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolService, Rol, RolPage } from '../../services/rol.service';

@Component({
  selector: 'app-crud-rol',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-rol.component.html',
  styleUrls: ['./crud-rol.component.css'],
})
export class CrudRolComponent {
  roles: Rol[] = [];
  allRoles: Rol[] = []; 
  showModal = false;
  editingRol: Rol | null = null;
  rolData: Partial<Rol> = {};
  page = 0;
  size = 5;
  totalPages = 1;
  totalElements = 0;
  pageSizes = [5, 10, 20, 50];
  searchText: string = '';

  constructor(private rolService: RolService) {}

  ngOnInit() {
    this.loadRoles();
  }

  trackByRolId(index: number, rol: any): any {
    return rol.id;
  }

  loadRoles() {
    this.rolService.obtenerRoles(this.page, this.size).subscribe(pageData => {
      this.roles = pageData.content;
      this.allRoles = pageData.content; // Guarda copia sin filtrar
      this.totalPages = pageData.totalPages;
      this.totalElements = pageData.totalElements;
    });
  }

  onPageSizeChange(event: any) {
    this.size = +event.target.value;
    this.page = 0;
    this.loadRoles();
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadRoles();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.loadRoles();
    }
  }

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
    // Aquí solo agregamos localmente, pero deberías llamar a tu service para guardar en backend
    if (!this.rolData.nombre) return;

    if (this.editingRol) {
      const idx = this.roles.findIndex(r => r.nombre === this.editingRol!.nombre);
      if (idx >= 0) {
        this.roles[idx] = { ...this.editingRol, ...this.rolData } as Rol;
      }
    } else {
      this.roles.push({
        nombre: this.rolData.nombre!,
        descripcion: this.rolData.descripcion || '',
      });
    }
    this.closeModal();
  }

  deleteRol(rol: Rol) {
    if (confirm(`¿Seguro que deseas eliminar el rol "${rol.nombre}"?`)) {
      this.roles = this.roles.filter(r => r.nombre !== rol.nombre);
      this.allRoles = this.allRoles.filter(r => r.nombre !== rol.nombre);
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingRol = null;
    this.rolData = {};
  }

  buscarRol() {
    // Búsqueda local sobre la página actual
    if (this.searchText.trim() === '') {
      this.roles = [...this.allRoles];
    } else {
      const lowerSearch = this.searchText.toLowerCase();
      this.roles = this.allRoles.filter(
        r => r.nombre.toLowerCase().includes(lowerSearch) || 
             (r.descripcion?.toLowerCase().includes(lowerSearch))
      );
    }
  }
}