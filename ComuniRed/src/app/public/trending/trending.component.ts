import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface Evento {
  id: number
  titulo: string
  categoria: string
  fecha: string
  imagen: string
  likes: number
  comentarios: number
  compartidos: number
  guardados: number
  liked: boolean
  saved: boolean
}

@Component({
  selector: "app-trending",
  templateUrl: "./trending.component.html",
  styleUrls: ["./trending.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TrendingComponent implements OnInit {
  eventos: Evento[] = [
    {
      id: 1,
      titulo: "Concierto de Rock en Vivo",
      categoria: "Música",
      fecha: "2024-12-15",
      imagen: "https://via.placeholder.com/300x200?text=Concierto+Rock",
      likes: 1250,
      comentarios: 89,
      compartidos: 342,
      guardados: 156,
      liked: false,
      saved: false,
    },
    {
      id: 2,
      titulo: "Festival de Cine Internacional",
      categoria: "Cine",
      fecha: "2024-12-20",
      imagen: "https://via.placeholder.com/300x200?text=Festival+Cine",
      likes: 2100,
      comentarios: 234,
      compartidos: 567,
      guardados: 289,
      liked: false,
      saved: false,
    },
    {
      id: 3,
      titulo: "Maratón Benéfico por la Salud",
      categoria: "Deportes",
      fecha: "2024-12-10",
      imagen: "https://via.placeholder.com/300x200?text=Maraton",
      likes: 890,
      comentarios: 45,
      compartidos: 123,
      guardados: 67,
      liked: false,
      saved: false,
    },
    {
      id: 4,
      titulo: "Exposición de Arte Moderno",
      categoria: "Arte",
      fecha: "2024-12-25",
      imagen: "https://via.placeholder.com/300x200?text=Exposicion+Arte",
      likes: 1567,
      comentarios: 178,
      compartidos: 456,
      guardados: 234,
      liked: false,
      saved: false,
    },
  ]

  eventosFiltrados: Evento[] = []
  categorias: string[] = ["Todos", "Música", "Cine", "Deportes", "Arte"]
  categoriaSeleccionada = "Todos"
  busqueda = ""

  ngOnInit(): void {
    this.filtrarEventos()
  }

  filtrarEventos(): void {
    this.eventosFiltrados = this.eventos.filter((evento) => {
      const cumpleCategoria = this.categoriaSeleccionada === "Todos" || evento.categoria === this.categoriaSeleccionada
      const cumpleBusqueda = evento.titulo.toLowerCase().includes(this.busqueda.toLowerCase())
      return cumpleCategoria && cumpleBusqueda
    })
  }

  seleccionarCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria
    this.filtrarEventos()
  }

  buscar(): void {
    this.filtrarEventos()
  }

  toggleLike(evento: Evento): void {
    evento.liked = !evento.liked
    evento.likes += evento.liked ? 1 : -1
  }

  toggleSave(evento: Evento): void {
    evento.saved = !evento.saved
    evento.guardados += evento.saved ? 1 : -1
  }

  compartir(evento: Evento): void {
    evento.compartidos++
    alert(`Compartiendo: ${evento.titulo}`)
  }

  comentar(evento: Evento): void {
    alert(`Comentando en: ${evento.titulo}`)
  }

  formatearNumero(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K"
    }
    return num.toString()
  }

  formatearTitulo(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
  }
}