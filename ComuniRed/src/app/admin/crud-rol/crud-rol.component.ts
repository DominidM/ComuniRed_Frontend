import { Component, Renderer2, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { RolService, Rol, RolPage } from '../../services/rol.service';
import { LoadingOverlayComponent } from '../../shared/components/loading/loading.component';
import {
  DataTableComponent,
  DataTableColumn,
  DataTableCellDirective,
} from '../../shared/components/data-table/data-table.component';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';
import { AdminSearchComponent } from '../../shared/components/admin-search/admin-search.component';

@Component({
  selector: 'app-crud-rol',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingOverlayComponent, DataTableComponent, DataTableCellDirective, WorkspaceHeaderComponent, AdminSearchComponent],
  templateUrl: './crud-rol.component.html',
  styleUrls: ['./crud-rol.component.css'],
})
export class CrudRolComponent implements AfterViewChecked {
  @ViewChild('modal') modalRef!: ElementRef;
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
  loading = false;

  columns: DataTableColumn[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'acciones', label: 'Acciones' },
  ];

  constructor(private renderer: Renderer2, private rolService: RolService) {}

  ngOnInit() {
    this.loadRoles();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  trackByRolId(index: number, rol: Rol): any {
    return rol.id || index;
  }

  loadRoles() {
    this.loading = true;
    this.rolService.obtenerRoles(this.page, this.size)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
      next: (data) => {
        this.roles = data.content;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
      },
      error: (error) => {
        console.error('Error cargando roles:', error);
      }
    });
}

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages || p === this.page) return;
    this.page = p;
    this.loadRoles();
  }

  onPageSizeChange(size: any) {
    this.size = +size;
    this.page = 0;
    this.loadRoles();
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
    if (!this.rolData.nombre) return;
    if (this.editingRol) {
      // Editar en backend
      this.rolService.editarRol(this.editingRol.id!, this.rolData.nombre!, this.rolData.descripcion || '').subscribe(() => {
        this.loadRoles();
        this.closeModal();
      });
    } else {
      // Crear en backend
      this.rolService.crearRol(this.rolData.nombre!, this.rolData.descripcion || '').subscribe(() => {
        this.loadRoles();
        this.closeModal();
      });
    }
  }

  deleteRol(rol: Rol) {

   
    if (confirm('¿Estás seguro de que quieres eliminar este rol?')) {
      const id = rol.id;

      // Validación adicional
      if (!id || id === undefined || id === null || id === '') {
        alert('Error: ID del rol no válido');
        console.error('ID inválido detectado');
        return;
      }
      
      this.rolService.eliminarRol(String(id)).subscribe({
        next: (result) => {
          if (result) {
            this.loadRoles();
          }
        },
        error: (error) => {
          console.error('Error completo:', error);
          console.error('Error message:', error.message);
          console.error('Error graphQLErrors:', error.graphQLErrors);
          alert(`Error al eliminar rol: ${error.message || 'Error interno del servidor'}`);
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingRol = null;
    this.rolData = {};
  }

  buscarRol() {
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

  limpiarBusqueda() {
    this.searchText = '';
    this.roles = [...this.allRoles];
  }

  ngAfterViewChecked(): void {
    if (this.showModal && this.modalRef && this.modalRef.nativeElement.parentNode !== document.body) {
      this.renderer.appendChild(document.body, this.modalRef.nativeElement);
    }
  }
}