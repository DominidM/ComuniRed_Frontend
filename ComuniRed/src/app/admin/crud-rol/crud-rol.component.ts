import { Component, Renderer2, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
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

  constructor(private renderer: Renderer2, private rolService: RolService) {}

  ngOnInit() {
    this.loadRoles();
  }

  trackByRolId(index: number, rol: Rol): any {
    console.log('trackBy - index:', index, 'rol:', rol, 'rol.id:', rol.id);
    return rol.id || index; // Fallback al index si no hay ID
  }

  loadRoles() {
    console.log('=== DEBUG LOADROLES ===');
    console.log('Cargando roles - page:', this.page, 'size:', this.size);
    
    this.rolService.obtenerRoles(this.page, this.size).subscribe({
      next: (data) => {
        console.log('Datos recibidos del backend:', data);
        console.log('Roles content:', data.content);
        
        // Debug cada rol individual
        data.content.forEach((rol, index) => {
          console.log(`Rol ${index}:`, rol);
          console.log(`Rol ${index} ID:`, rol.id, 'tipo:', typeof rol.id);
        });
        
        this.roles = data.content;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
      },
      error: (error) => {
        console.error('Error cargando roles:', error);
      }
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
    console.log('=== DEBUG DELETEROL ===');
    console.log('1. Objeto rol recibido:', rol);
    console.log('2. Tipo del objeto rol:', typeof rol);
    console.log('3. rol.id:', rol.id);
    console.log('4. Tipo de rol.id:', typeof rol.id);
    console.log('5. rol.id === undefined?', rol.id === undefined);
    console.log('6. rol.id === null?', rol.id === null);
    console.log('7. rol.id === ""?', rol.id === "");
    console.log('8. JSON.stringify(rol):', JSON.stringify(rol));
    console.log('9. Object.keys(rol):', Object.keys(rol));
    console.log('10. rol.hasOwnProperty("id"):', rol.hasOwnProperty('id'));
    
    if (confirm('¿Estás seguro de que quieres eliminar este rol?')) {
      const id = rol.id;
      console.log('11. ID extraído:', id);
      console.log('12. Tipo del ID extraído:', typeof id);
      console.log('13. ID convertido a string:', String(id));
      console.log('14. ID length:', id ? id.length : 'N/A');
      
      // Validación adicional
      if (!id || id === undefined || id === null || id === '') {
        alert('Error: ID del rol no válido');
        console.error('ID inválido detectado');
        return;
      }
      
      this.rolService.eliminarRol(String(id)).subscribe({
        next: (result) => {
          console.log('Resultado de eliminación:', result);
          if (result) {
            console.log('Rol eliminado exitosamente');
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

  ngAfterViewChecked(): void {
    if (this.showModal && this.modalRef && this.modalRef.nativeElement.parentNode !== document.body) {
      this.renderer.appendChild(document.body, this.modalRef.nativeElement);
    }
  }
}