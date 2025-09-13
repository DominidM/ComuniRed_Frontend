import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatCardModule } from "@angular/material/card"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatSelectModule } from "@angular/material/select"
import { FormsModule } from "@angular/forms"

interface Post {
  author: string
  date: string
  content: string
  category?: string
  likes?: number
  image?: string
}

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    FormsModule,
  ],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent {
  selectedCategory = ""
  newPostContent = ""

  posts: Post[] = [
    {
      author: "Juan Perez",
      date: "10 septiembre 2025",
      content: "¡Bienvenido a ComuniRed! Publica tu queja o consulta aquí.",
      category: "otros",
      likes: 5,
    },
    {
      author: "Ana Torres",
      date: "9 septiembre 2025",
      content: "¿Alguien sabe cómo contactar soporte directamente?",
      category: "otros",
      likes: 3,
    },
    {
      author: "María González",
      date: "8 septiembre 2025",
      content:
        "Pista completamente destruida en Av. Arequipa con Jr. Lampa. Varios huecos profundos que dañan los vehículos.",
      category: "pistas-rotas",
      likes: 12,
      image: "/assets/broken-road.jpg",
    },
  ]

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  getCategoryLabel(category: string | undefined): string {
    if (!category) return "Sin categoría"

    const labels: { [key: string]: string } = {
      "pistas-rotas": "Pistas rotas",
      "postes-sin-luz": "Postes sin luces",
      "pozos-sin-tapa": "Pozos sin tapas",
      "cables-expuestos": "Cables expuestos",
      otros: "Otros",
    }
    return labels[category] || "Sin categoría"
  }

  publishPost(): void {
    if (this.newPostContent.trim() && this.selectedCategory) {
      const newPost: Post = {
        author: "Usuario Actual", // Aquí pondrías el nombre del usuario logueado
        date: new Date().toLocaleDateString("es-ES"),
        content: this.newPostContent,
        category: this.selectedCategory,
        likes: 0,
      }

      this.posts.unshift(newPost) // Agregar al inicio del array
      this.newPostContent = ""
      this.selectedCategory = ""
    }
  }
}
