import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ComentarioService, Comentario } from '../../services/comentario.service'
import { forkJoin } from 'rxjs'

interface ComentarioConQueja extends Comentario {
  tituloQueja?: string
  categoriaQueja?: string
  estadoQueja?: string
  likes?: number
}

@Component({
  selector: "app-crud-comentario",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./crud-comentario.component.html",
  styleUrls: ["./crud-comentario.component.css"],
})
export class CrudComentarioComponent implements OnInit {
  comentarios: ComentarioConQueja[] = []
  comentariosOriginales: ComentarioConQueja[] = []
  filtroEstado = "Todos"
  filtroCategoria = "Todos"
  busqueda = ""
  mostrarFormulario = false
  mostrarDetalles = false
  comentarioSeleccionado: ComentarioConQueja | null = null
  editando = false
  cargando = false

  formularioComentario = {
    quejaId: "",
    usuarioId: "",
    texto: "",
  }

  // Estos valores deberían venir de tu servicio de configuración/autenticación
  usuarioActualId = "1" // ID del usuario logueado

  categorias = ["Pista rota", "Semáforo dañado", "Poste caído", "Basura", "Iluminación", "Otra"]
  estados = ["Pendiente", "En Revisión", "Resuelto"]

  constructor(private comentarioService: ComentarioService) {}

  ngOnInit(): void {
    this.cargarComentariosDatos()
  }

  cargarComentariosDatos(): void {
    this.cargando = true
    console.log('🔄 Iniciando carga de comentarios para usuario:', this.usuarioActualId)
    
    // Primero obtener los comentarios del usuario
    this.comentarioService.buscarComentariosPorUsuario(this.usuarioActualId)
      .subscribe({
        next: (comentarios) => {
          console.log('💬 Comentarios obtenidos:', comentarios)
          console.log('📊 Total de comentarios:', comentarios.length)
          
          if (comentarios.length === 0) {
            console.log('ℹ️ No hay comentarios para este usuario')
            this.comentariosOriginales = []
            this.comentarios = []
            this.cargando = false
            return
          }
          
          // Obtener los reportes relacionados
          this.comentarioService.obtenerReportesComentados(this.usuarioActualId, 0, 100)
            .subscribe({
              next: (reportes) => {
                console.log('📋 Reportes obtenidos:', reportes)
                console.log('📊 Total de reportes:', reportes.length)
                
                // Combinar comentarios con información de los reportes
                this.comentariosOriginales = comentarios.map(comentario => {
                  const reporte = reportes.find(r => r.id === comentario.queja_id)
                  console.log(`🔗 Enlazando comentario ${comentario.id} con reporte ${comentario.queja_id}:`, reporte)
                  
                  return {
                    ...comentario,
                    tituloQueja: reporte?.titulo || 'Sin título',
                    categoriaQueja: reporte?.categoria?.nombre || 'Sin categoría',
                    estadoQueja: reporte?.estado?.nombre || 'Pendiente',
                    likes: 0
                  }
                })
                
                this.comentarios = [...this.comentariosOriginales]
                console.log('✅ Datos cargados exitosamente:', this.comentarios)
                this.cargando = false
              },
              error: (error) => {
                console.error('❌ Error cargando reportes:', error)
                console.error('📝 Detalles del error:', JSON.stringify(error, null, 2))
                
                // Aún así mostrar los comentarios sin la info de reportes
                this.comentariosOriginales = comentarios.map(comentario => ({
                  ...comentario,
                  tituloQueja: 'Sin título',
                  categoriaQueja: 'Sin categoría',
                  estadoQueja: 'Pendiente',
                  likes: 0
                }))
                this.comentarios = [...this.comentariosOriginales]
                this.cargando = false
              }
            })
        },
        error: (error) => {
          console.error('❌ Error cargando comentarios:', error)
          console.error('📝 Detalles del error:', JSON.stringify(error, null, 2))
          this.cargando = false
        }
      })
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
      quejaId: "",
      usuarioId: this.usuarioActualId,
      texto: "",
    }
  }

  guardarComentario(): void {
    if (this.formularioComentario.quejaId && this.formularioComentario.texto) {
      this.comentarioService.agregarComentario(
        this.formularioComentario.quejaId,
        this.usuarioActualId,
        this.formularioComentario.texto
      ).subscribe({
        next: (nuevoComentario) => {
          console.log('✅ Comentario agregado:', nuevoComentario)
          this.cerrarFormulario()
          this.cargarComentariosDatos() // Recargar datos
        },
        error: (error) => {
          console.error('❌ Error agregando comentario:', error)
          alert('Error al agregar comentario')
        }
      })
    } else {
      alert('Por favor completa todos los campos requeridos')
    }
  }

  verDetalles(comentario: ComentarioConQueja): void {
    this.comentarioSeleccionado = { ...comentario }
    this.mostrarDetalles = true
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false
    this.comentarioSeleccionado = null
  }

  cambiarEstado(nuevoEstado: string): void {
    // El estado pertenece a la queja, no al comentario
    // Aquí deberías llamar a un servicio de quejas para actualizar el estado
    console.log('Cambiar estado a:', nuevoEstado)
    alert('La funcionalidad de cambiar estado debe implementarse en el servicio de quejas')
  }

  eliminarComentario(id: string): void {
    if (confirm("¿Deseas eliminar este comentario?")) {
      this.comentarioService.eliminarComentario(id, this.usuarioActualId)
        .subscribe({
          next: (resultado) => {
            if (resultado) {
              console.log('✅ Comentario eliminado')
              this.comentarios = this.comentarios.filter((c) => c.id !== id)
              this.comentariosOriginales = this.comentariosOriginales.filter((c) => c.id !== id)
              
              if (this.comentarioSeleccionado?.id === id) {
                this.cerrarDetalles()
              }
            }
          },
          error: (error) => {
            console.error('❌ Error eliminando comentario:', error)
            alert('Error al eliminar comentario')
          }
        })
    }
  }

  editarComentario(comentario: ComentarioConQueja): void {
    const nuevoTexto = prompt('Editar comentario:', comentario.texto)
    
    if (nuevoTexto && nuevoTexto.trim() !== '') {
      this.comentarioService.actualizarComentario(
        comentario.id,
        this.usuarioActualId,
        nuevoTexto
      ).subscribe({
        next: (comentarioActualizado) => {
          console.log('✅ Comentario actualizado:', comentarioActualizado)
          
          // Actualizar en la lista
          const index = this.comentarios.findIndex(c => c.id === comentario.id)
          if (index > -1) {
            this.comentarios[index].texto = comentarioActualizado.texto
            this.comentarios[index].fecha_modificacion = comentarioActualizado.fecha_modificacion
          }
          
          // Actualizar en originales
          const indexOrig = this.comentariosOriginales.findIndex(c => c.id === comentario.id)
          if (indexOrig > -1) {
            this.comentariosOriginales[indexOrig].texto = comentarioActualizado.texto
            this.comentariosOriginales[indexOrig].fecha_modificacion = comentarioActualizado.fecha_modificacion
          }
          
          // Actualizar en detalles si está abierto
          if (this.comentarioSeleccionado?.id === comentario.id) {
            this.comentarioSeleccionado.texto = comentarioActualizado.texto
            this.comentarioSeleccionado.fecha_modificacion = comentarioActualizado.fecha_modificacion
          }
        },
        error: (error) => {
          console.error('❌ Error actualizando comentario:', error)
          alert('Error al actualizar comentario')
        }
      })
    }
  }

  get comentariosFiltrados(): ComentarioConQueja[] {
    let filtrados = [...this.comentarios]
    
    // Filtro por estado
    if (this.filtroEstado !== "Todos") {
      filtrados = filtrados.filter(c => c.estadoQueja === this.filtroEstado)
    }
    
    // Filtro por categoría
    if (this.filtroCategoria !== "Todos") {
      filtrados = filtrados.filter(c => c.categoriaQueja === this.filtroCategoria)
    }
    
    // Búsqueda
    if (this.busqueda.trim() !== "") {
      const busquedaLower = this.busqueda.toLowerCase()
      filtrados = filtrados.filter(c => 
        c.author.nombre.toLowerCase().includes(busquedaLower) ||
        c.author.apellido.toLowerCase().includes(busquedaLower) ||
        c.tituloQueja?.toLowerCase().includes(busquedaLower) ||
        c.texto.toLowerCase().includes(busquedaLower)
      )
    }
    
    // Ordenar por fecha (más recientes primero)
    return filtrados.sort((a, b) => 
      new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
    )
  }
}