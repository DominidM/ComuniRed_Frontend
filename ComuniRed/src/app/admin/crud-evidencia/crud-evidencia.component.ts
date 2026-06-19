import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { WorkspaceHeaderComponent } from "../../shared/components/workspace-header/workspace-header.component"
import { AdminSearchComponent } from "../../shared/components/admin-search/admin-search.component"

interface Evidencia {
  id: number
  titulo: string
  descripcion: string
  imagen: string
  usuario: string
  avatar: string
  estado: "Pendiente" | "Verificada" | "Rechazada"
  fecha: Date
  ubicacion: string
  categoria: string
}

@Component({
  selector: "app-crud-evidencia",
  standalone: true,
  imports: [CommonModule, FormsModule, WorkspaceHeaderComponent, AdminSearchComponent],
  templateUrl: "./crud-evidencia.component.html",
  styleUrls: ["./crud-evidencia.component.css"],
})
export class CrudEvidenciaComponent implements OnInit {
  evidencias: Evidencia[] = []
  filtroEstado = "Todos"
  filtroCategoria = "Todos"
  busqueda = ""
  mostrarFormulario = false
  mostrarDetalles = false
  evidenciaSeleccionada: Evidencia | null = null

  formularioEvidencia = {
    titulo: "",
    descripcion: "",
    usuario: "",
    ubicacion: "",
    categoria: "Pista rota",
    avatar: "",
    imagen: "",
  }

  categorias = ["Pista rota", "Semáforo dañado", "Poste caído", "Basura", "Iluminación", "Otra"]
  estados = ["Pendiente", "Verificada", "Rechazada"]

  ngOnInit(): void {
    this.cargarEvidenciasDatos()
  }

  cargarEvidenciasDatos(): void {
    this.evidencias = [
      {
        id: 1,
        titulo: "Pista con hueco profundo",
        descripcion: "Hueco de aproximadamente 30cm de profundidad en la Carrera 5",
        imagen: "https://res.cloudinary.com/dtpaigqhq/image/upload/v1764655257/VOGTBBWE2JA3RCC4CJ2XR26LQU_tzvwiw.jpg",
        usuario: "Juan Pérez",
        avatar: "👤",
        estado: "Pendiente",
        fecha: new Date("2024-11-28"),
        ubicacion: "Carrera 5 y Calle 10",
        categoria: "Pista rota",
      },
      {
        id: 2,
        titulo: "Semáforo no funciona",
        descripcion: "Semáforo completamente apagado en la intersección principal",
        imagen: "https://res.cloudinary.com/dtpaigqhq/image/upload/v1764655293/download_etriub.jpg",
        usuario: "María González",
        avatar: "👩",
        estado: "Verificada",
        fecha: new Date("2024-11-27"),
        ubicacion: "Calle 3 y Carrera 7",
        categoria: "Semáforo dañado",
      },
      {
        id: 3,
        titulo: "Poste de luz caído",
        descripcion: "Poste de alumbrado público caído bloqueando la avenida",
        imagen: "https://res.cloudinary.com/dtpaigqhq/image/upload/v1764655359/7OWX53MGPVA5BLE5IVASLMGJ7Y_ygn055.jpg",
        usuario: "Carlos López",
        avatar: "👨",
        estado: "Verificada",
        fecha: new Date("2024-11-25"),
        ubicacion: "Avenida Principal",
        categoria: "Poste caído",
      },
    ]
  }

  abrirFormulario(): void {
    this.mostrarFormulario = true
    this.resetearFormulario()
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false
    this.resetearFormulario()
  }

  resetearFormulario(): void {
    this.formularioEvidencia = {
      titulo: "",
      descripcion: "",
      usuario: "",
      ubicacion: "",
      categoria: "Pista rota",
      avatar: "",
      imagen: "",
    }
  }

  guardarEvidencia(): void {
    if (this.formularioEvidencia.titulo && this.formularioEvidencia.usuario && this.formularioEvidencia.imagen) {
      const nuevaEvidencia: Evidencia = {
        id: this.evidencias.length + 1,
        titulo: this.formularioEvidencia.titulo,
        descripcion: this.formularioEvidencia.descripcion,
        imagen: this.formularioEvidencia.imagen,
        usuario: this.formularioEvidencia.usuario,
        avatar: this.formularioEvidencia.avatar || "👤",
        estado: "Pendiente",
        fecha: new Date(),
        ubicacion: this.formularioEvidencia.ubicacion,
        categoria: this.formularioEvidencia.categoria,
      }
      this.evidencias.unshift(nuevaEvidencia)
      this.cerrarFormulario()
    }
  }

  verDetalles(evidencia: Evidencia): void {
    this.evidenciaSeleccionada = evidencia
    this.mostrarDetalles = true
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false
    this.evidenciaSeleccionada = null
  }

  cambiarEstado(nuevoEstado: string): void {
    if (this.evidenciaSeleccionada) {
      const index = this.evidencias.findIndex((e) => e.id === this.evidenciaSeleccionada!.id)
      if (index > -1) {
        this.evidencias[index].estado = nuevoEstado as any
        this.evidenciaSeleccionada.estado = nuevoEstado as any
      }
    }
  }

  eliminarEvidencia(id: number): void {
    if (confirm("¿Deseas eliminar esta evidencia?")) {
      this.evidencias = this.evidencias.filter((e) => e.id !== id)
      if (this.evidenciaSeleccionada?.id === id) {
        this.cerrarDetalles()
      }
    }
  }

  onImagenSeleccionada(event: any): void {
    const archivo = event.target.files[0]
    if (archivo) {
      const lector = new FileReader()
      lector.onload = (e: any) => {
        this.formularioEvidencia.imagen = e.target.result
      }
      lector.readAsDataURL(archivo)
    }
  }

  get filterValues(): { [key: string]: string } {
    return { estado: this.filtroEstado, categoria: this.filtroCategoria };
  }

  getEstadoOptions() { return this.estados.map(e => ({ value: e, label: e })); }
  getCategoriaOptions() { return this.categorias.map(c => ({ value: c, label: c })); }

  onFilterChange(filter: { key: string; value: string }): void {
    if (filter.key === 'estado') this.filtroEstado = filter.value;
    if (filter.key === 'categoria') this.filtroCategoria = filter.value;
  }

  buscarEvidencias(): void {}
  limpiarBusqueda(): void {
    this.busqueda = '';
  }

  get evidenciasFiltradas(): Evidencia[] {
    return this.evidencias
      .filter((e) => {
        const cumpleFiltroEstado = this.filtroEstado === "Todos" || e.estado === this.filtroEstado
        const cumpleFiltroCategoria = this.filtroCategoria === "Todos" || e.categoria === this.filtroCategoria
        const cumpleBusqueda =
          this.busqueda === "" ||
          e.usuario.toLowerCase().includes(this.busqueda.toLowerCase()) ||
          e.titulo.toLowerCase().includes(this.busqueda.toLowerCase())
        return cumpleFiltroEstado && cumpleFiltroCategoria && cumpleBusqueda
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }
}
