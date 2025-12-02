import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface Comentario {
  id: number
  usuario: string
  avatar: string
  titulo: string
  descripcion: string
  categoria: string
  estado: "Pendiente" | "En Revisión" | "Resuelto"
  fecha: Date
  likes: number
}

@Component({
  selector: "app-crud-comentario",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./crud-comentario.component.html",
  styleUrls: ["./crud-comentario.component.css"],
})
export class CrudComentarioComponent implements OnInit {
  comentarios: Comentario[] = []
  filtroEstado = "Todos"
  filtroCategoria = "Todos"
  busqueda = ""
  mostrarFormulario = false
  mostrarDetalles = false
  comentarioSeleccionado: Comentario | null = null
  editando = false

  formularioComentario = {
    usuario: "",
    titulo: "",
    descripcion: "",
    categoria: "Pista rota",
    avatar: "",
  }

  categorias = ["Pista rota", "Semáforo dañado", "Poste caído", "Basura", "Iluminación", "Otra"]
  estados = ["Pendiente", "En Revisión", "Resuelto"]

  ngOnInit(): void {
    this.cargarComentariosDatos()
  }

  cargarComentariosDatos(): void {
    this.comentarios = [
      {
        id: 1,
        usuario: "Juan Pérez",
        avatar: "👤",
        titulo: "Pista con hueco profundo",
        descripcion: "En la Carrera 5 hay un hueco muy profundo que puede causar accidentes.",
        categoria: "Pista rota",
        estado: "Pendiente",
        fecha: new Date("2024-11-28"),
        likes: 5,
      },
      {
        id: 2,
        usuario: "María González",
        avatar: "👩",
        titulo: "Semáforo no funciona",
        descripcion: "El semáforo de la intersección Calle 3 y Carrera 7 está apagado.",
        categoria: "Semáforo dañado",
        estado: "En Revisión",
        fecha: new Date("2024-11-27"),
        likes: 12,
      },
      {
        id: 3,
        usuario: "Carlos López",
        avatar: "👨",
        titulo: "Poste de luz caído",
        descripcion: "Poste de alumbrado público caído en la Avenida Principal.",
        categoria: "Poste caído",
        estado: "Resuelto",
        fecha: new Date("2024-11-25"),
        likes: 8,
      },
    ]
  }

  abrirFormulario(): void {
    this.mostrarFormulario = true
    this.editando = false
    this.resetearFormulario()
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false
    this.resetearFormulario()
  }

  resetearFormulario(): void {
    this.formularioComentario = {
      usuario: "",
      titulo: "",
      descripcion: "",
      categoria: "Pista rota",
      avatar: "",
    }
  }

  guardarComentario(): void {
    if (this.formularioComentario.usuario && this.formularioComentario.titulo) {
      const nuevoComentario: Comentario = {
        id: this.comentarios.length + 1,
        usuario: this.formularioComentario.usuario,
        avatar: this.formularioComentario.avatar || "👤",
        titulo: this.formularioComentario.titulo,
        descripcion: this.formularioComentario.descripcion,
        categoria: this.formularioComentario.categoria,
        estado: "Pendiente",
        fecha: new Date(),
        likes: 0,
      }
      this.comentarios.unshift(nuevoComentario)
      this.cerrarFormulario()
    }
  }

  verDetalles(comentario: Comentario): void {
    this.comentarioSeleccionado = comentario
    this.mostrarDetalles = true
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false
    this.comentarioSeleccionado = null
  }

  cambiarEstado(nuevoEstado: string): void {
    if (this.comentarioSeleccionado) {
      const index = this.comentarios.findIndex((c) => c.id === this.comentarioSeleccionado!.id)
      if (index > -1) {
        this.comentarios[index].estado = nuevoEstado as any
        this.comentarioSeleccionado.estado = nuevoEstado as any
      }
    }
  }

  eliminarComentario(id: number): void {
    if (confirm("¿Deseas eliminar este comentario?")) {
      this.comentarios = this.comentarios.filter((c) => c.id !== id)
      if (this.comentarioSeleccionado?.id === id) {
        this.cerrarDetalles()
      }
    }
  }

  get comentariosFiltrados(): Comentario[] {
    return this.comentarios
      .filter((c) => {
        const cumpleFiltroEstado = this.filtroEstado === "Todos" || c.estado === this.filtroEstado
        const cumpleFiltroCategoria = this.filtroCategoria === "Todos" || c.categoria === this.filtroCategoria
        const cumpleBusqueda =
          this.busqueda === "" ||
          c.usuario.toLowerCase().includes(this.busqueda.toLowerCase()) ||
          c.titulo.toLowerCase().includes(this.busqueda.toLowerCase())
        return cumpleFiltroEstado && cumpleFiltroCategoria && cumpleBusqueda
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }
}
