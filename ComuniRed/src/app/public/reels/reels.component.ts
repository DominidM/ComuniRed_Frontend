import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface Reel {
  id: number
  title: string
  author: string
  avatar: string
  videoUrl: string
  thumbnail: string
  likes: number
  comments: number
  shares: number
  liked: boolean
  views: number
  timestamp: string
  description: string
}

@Component({
  selector: "app-reels",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./reels.component.html",
  styleUrls: ["./reels.component.css"],
})
export class ReelsComponent {
  currentReelIndex = 0
  uploadProgress = 0
  isUploading = false
  newReelTitle = ""
  newReelDescription = ""
  selectedFile: File | null = null

  reels: Reel[] = [
    {
      id: 1,
      title: "Infraestructura Dañada - Calle Principal",
      author: "Juan Pérez",
      avatar: "JP",
      videoUrl: "#",
      thumbnail: "/damaged-infrastructure.jpg",
      likes: 245,
      comments: 18,
      shares: 32,
      liked: false,
      views: 1200,
      timestamp: "Hace 2 horas",
      description: "Reportando daños en la infraestructura de la calle principal. Se necesita reparación urgente.",
    },
    {
      id: 2,
      title: "Proyecto Comunitario - Limpieza de Parque",
      author: "María García",
      avatar: "MG",
      videoUrl: "#",
      thumbnail: "/community-cleanup.jpg",
      likes: 567,
      comments: 42,
      shares: 89,
      liked: false,
      views: 2840,
      timestamp: "Hace 5 horas",
      description: "Actividad de limpieza comunitaria en el parque central. ¡Todos unidos por ComuniRed!",
    },
    {
      id: 3,
      title: "Solicitud de Alumbrado Público",
      author: "Carlos López",
      avatar: "CL",
      videoUrl: "#",
      thumbnail: "/street-lighting.jpg",
      likes: 189,
      comments: 12,
      shares: 25,
      liked: false,
      views: 890,
      timestamp: "Hace 1 día",
      description: "Iluminación deficiente en la avenida. Solicitamos mejora del alumbrado público.",
    },
    {
      id: 4,
      title: "Mejora de Aceras - Exitosa",
      author: "Ana Martínez",
      avatar: "AM",
      videoUrl: "#",
      thumbnail: "/sidewalk-improvement.jpg",
      likes: 834,
      comments: 67,
      shares: 156,
      liked: false,
      views: 4200,
      timestamp: "Hace 2 días",
      description: "Reparación de aceras completada. ¡Gracias por reportar! La comunidad hace la diferencia.",
    },
    {
      id: 5,
      title: "Nuevo Parque Recreativo Inaugurado",
      author: "Roberto Silva",
      avatar: "RS",
      videoUrl: "#",
      thumbnail: "/user-reel.jpg",
      likes: 1205,
      comments: 95,
      shares: 234,
      liked: false,
      views: 5600,
      timestamp: "Hace 3 horas",
      description: "Inauguración oficial del nuevo parque recreativo. ¡Excelente espacio para la comunidad!",
    },
    {
      id: 6,
      title: "Reparación de Drenaje Completada",
      author: "Laura Rodríguez",
      avatar: "LR",
      videoUrl: "#",
      thumbnail: "/user-reel.jpg",
      likes: 456,
      comments: 28,
      shares: 67,
      liked: false,
      views: 2100,
      timestamp: "Hace 6 horas",
      description: "Sistema de drenaje reparado en la zona norte. Gracias al equipo de trabajo.",
    },
  ]

  nextReel() {
    if (this.currentReelIndex < this.reels.length - 1) {
      this.currentReelIndex++
    }
  }

  prevReel() {
    if (this.currentReelIndex > 0) {
      this.currentReelIndex--
    }
  }

  toggleLike(reel: Reel) {
    reel.liked = !reel.liked
    reel.likes += reel.liked ? 1 : -1
  }

  onFileSelected(event: any) {
    const file = event.target.files[0]
    if (file) {
      this.selectedFile = file
    }
  }

  uploadReel() {
    if (!this.selectedFile || !this.newReelTitle.trim()) {
      alert("Por favor selecciona un video y agrega un título")
      return
    }

    this.isUploading = true
    let progress = 0

    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress > 100) progress = 100
      this.uploadProgress = progress

      if (progress === 100) {
        clearInterval(interval)
        setTimeout(() => {
          const newReel: Reel = {
            id: this.reels.length + 1,
            title: this.newReelTitle,
            author: "Tu Usuario",
            avatar: "TU",
            videoUrl: "#",
            thumbnail: "/user-reel.jpg",
            likes: 0,
            comments: 0,
            shares: 0,
            liked: false,
            views: 0,
            timestamp: "Ahora",
            description: this.newReelDescription,
          }

          this.reels.unshift(newReel)
          this.currentReelIndex = 0
          this.resetForm()
          this.isUploading = false
          alert("¡Reel subido exitosamente!")
        }, 500)
      }
    }, 200)
  }

  resetForm() {
    this.newReelTitle = ""
    this.newReelDescription = ""
    this.selectedFile = null
    this.uploadProgress = 0
  }

  get currentReel(): Reel {
    return this.reels[this.currentReelIndex]
  }
}
