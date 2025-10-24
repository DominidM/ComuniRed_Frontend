import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"

interface TrendingItem {
  id: number
  nombre: string
  cantidad: number
  porcentaje: number
}

@Component({
  selector: "app-trending",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./trending.component.html",
  styleUrls: ["./trending.component.css"],
})
export class TrendingComponent implements OnInit {
  currentView = "populares"

  trendingData: TrendingItem[] = [
    { id: 1, nombre: "Vías", cantidad: 245, porcentaje: 35 },
    { id: 2, nombre: "Alumbrado", cantidad: 180, porcentaje: 26 },
    { id: 3, nombre: "Agua", cantidad: 165, porcentaje: 24 },
    { id: 4, nombre: "Limpieza", cantidad: 95, porcentaje: 14 },
    { id: 5, nombre: "Tránsito", cantidad: 15, porcentaje: 2 },
  ]

  reportesRecientes = [
    {
      id: 4,
      numero: "#4",
      titulo: "Bache gigante en Av. Principal",
      descripcion: "Hay un bache muy grande que ha causado varios accidentes. Necesita atención urgente.",
      tags: ["Baches", "En Proceso"],
      likes: 80,
      comentarios: 8,
      ubicacion: "Av. Principal #123, Col. Centro",
    },
    {
      id: 3,
      numero: "#3",
      titulo: "Falta de iluminación en parque",
      descripcion: "El parque está completamente oscuro por las noches, representa un peligro.",
      tags: ["Alumbrado Público", "Pendiente"],
      likes: 101,
      comentarios: 15,
      ubicacion: "Parque Central, Col. Roma",
    },
    {
      id: 2,
      numero: "#2",
      titulo: "Fuga de agua en la calle",
      descripcion: "Hay una fuga de agua considerable que está inundando la calle.",
      tags: ["Alcantarillado", "Resuelta"],
      likes: 168,
      comentarios: 22,
      ubicacion: "Calle Insurgentes #456",
    },
    {
      id: 1,
      numero: "#1",
      titulo: "Acumulación de basura",
      descripcion: "Hace una semana que no pasa el camión recolector de basura.",
      tags: ["Basura", "En Proceso"],
      likes: 169,
      comentarios: 31,
      ubicacion: "Col. Condesa, Calle Amsterdam",
    },
  ]

  reportesPopulares = [
    {
      id: 1,
      numero: "#1",
      titulo: "Acumulación de basura",
      descripcion: "Hace una semana que no pasa el camión recolector de basura.",
      tags: ["Basura", "En Proceso"],
      likes: 169,
      comentarios: 31,
      ubicacion: "Col. Condesa, Calle Amsterdam",
    },
    {
      id: 2,
      numero: "#2",
      titulo: "Fuga de agua en la calle",
      descripcion: "Hay una fuga de agua considerable que está inundando la calle.",
      tags: ["Alcantarillado", "Resuelta"],
      likes: 168,
      comentarios: 22,
      ubicacion: "Calle Insurgentes #456",
    },
    {
      id: 3,
      numero: "#3",
      titulo: "Falta de iluminación en parque",
      descripcion: "El parque está completamente oscuro por las noches, representa un peligro.",
      tags: ["Alumbrado Público", "Pendiente"],
      likes: 101,
      comentarios: 15,
      ubicacion: "Parque Central, Col. Roma",
    },
    {
      id: 4,
      numero: "#4",
      titulo: "Bache gigante en Av. Principal",
      descripcion: "Hay un bache muy grande que ha causado varios accidentes. Necesita atención urgente.",
      tags: ["Baches", "En Proceso"],
      likes: 80,
      comentarios: 8,
      ubicacion: "Av. Principal #123, Col. Centro",
    },
  ]

  constructor() {}

  ngOnInit(): void {}

  changeView(view: string): void {
    this.currentView = view
  }

  isViewActive(view: string): boolean {
    return this.currentView === view
  }

  getReportes() {
    return this.currentView === "recientes" ? this.reportesRecientes : this.reportesPopulares
  }
}