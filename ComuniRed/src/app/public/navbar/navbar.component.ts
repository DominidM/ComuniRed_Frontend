import { Component, EventEmitter, Output, HostListener, OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { QuejaService } from "../../services/queja.service"
import { UsuarioService } from "../../services/usuario.service"
import { ThemeService } from "../../services/theme.service" // <-- 1. Importación de ThemeService

interface SearchResult {
  type: "reporte" | "persona"
  id: string
  titulo?: string
  nombre?: string
  apellido?: string
  foto_perfil?: string
  categoria?: string
  fecha?: string
}

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit, OnDestroy {
  query = ""
  isDarkMode = false // <-- RENOMBRADO para ser consistente con AdminComponent
  notificationCount = 5
  logoUrl = "https://res.cloudinary.com/dxuk9bogw/image/upload/v1761270927/fcd83bdf-0f03-44bf-9f55-7cfdc8244e99.png"
  userAvatarUrl = "https://ui-avatars.com/api/?name=ComuniRed&background=0B3B36&color=fff"

  showSearchResults = false
  searchResults: SearchResult[] = []
  searching = false
  currentUserId?: string

  isNavbarHidden = false
  private lastScrollY = 0
  private scrollThreshold = 10

  @Output() search = new EventEmitter<string>()
  @Output() hiddenChange = new EventEmitter<boolean>()

  private debounceTimer?: any
  private debounceMs = 350

  constructor(
    private router: Router,
    private quejaService: QuejaService,
    private usuarioService: UsuarioService,
    private themeService: ThemeService // <-- 2. Inyección de ThemeService
  ) { }

  ngOnInit(): void {
    // 3. Carga Inicial del Tema (replicando la lógica de AdminComponent.ngOnInit)
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark-mode');
    } else {
      // Asegurar la limpieza en caso de que se haya cargado previamente un tema oscuro
      document.documentElement.classList.remove('dark-mode');
      this.isDarkMode = false;
    }

    const user = this.usuarioService.getUser()
    if (user) {
      this.currentUserId = (user as any).id
    }
  }

  @HostListener("window:scroll")
  onWindowScroll(): void {
    const currentScrollY = window.scrollY
    const scrollDelta = currentScrollY - this.lastScrollY

    const previous = this.isNavbarHidden

    if (scrollDelta > this.scrollThreshold && currentScrollY > 100) {
      this.isNavbarHidden = true
    } else if (scrollDelta < -this.scrollThreshold || currentScrollY < 100) {
      this.isNavbarHidden = false
    }

    if (this.isNavbarHidden !== previous) {
      this.hiddenChange.emit(this.isNavbarHidden)
    }

    this.lastScrollY = currentScrollY
  }

  ngOnDestroy(): void {
    // cleanup si necesario
  }

  onQueryChange(value: any): void {
    if (value && typeof value !== "string" && (value as Event).target) {
      const target = (value as Event).target as HTMLInputElement
      this.query = target.value
    } else {
      this.query = (value ?? "").toString()
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    if (!this.query.trim()) {
      this.showSearchResults = false
      this.searchResults = []
      return
    }

    this.debounceTimer = setTimeout(() => {
      this.performSearch(this.query.trim())
      this.search.emit(this.query.trim())
    }, this.debounceMs)
  }

  performSearch(term: string): void {
    if (!term || !this.currentUserId) return

    this.searching = true
    this.showSearchResults = true

    this.quejaService.obtenerQuejas(this.currentUserId).subscribe({
      next: (quejas) => {
        const termLower = term.toLowerCase()

        const reportesResults: SearchResult[] = quejas
          .filter(
            (q) =>
              q.titulo.toLowerCase().includes(termLower) ||
              q.descripcion.toLowerCase().includes(termLower) ||
              q.categoria?.nombre.toLowerCase().includes(termLower),
          )
          .slice(0, 5)
          .map((q) => ({
            type: "reporte" as const,
            id: q.id,
            titulo: q.titulo,
            categoria: q.categoria?.nombre,
            fecha: q.fecha_creacion,
          }))

        const usuariosMap = new Map<string, SearchResult>()
        quejas.forEach((q) => {
          if (q.usuario) {
            const nombreCompleto = `${q.usuario.nombre} ${q.usuario.apellido}`.toLowerCase()
            if (nombreCompleto.includes(termLower) && !usuariosMap.has(q.usuario.id)) {
              usuariosMap.set(q.usuario.id, {
                type: "persona" as const,
                id: q.usuario.id,
                nombre: q.usuario.nombre,
                apellido: q.usuario.apellido,
                foto_perfil: q.usuario.foto_perfil,
              })
            }
          }
        })

        const personasResults = Array.from(usuariosMap.values()).slice(0, 5)

        this.searchResults = [...reportesResults, ...personasResults]
        this.searching = false
      },
      error: (err) => {
        console.error("Error al buscar:", err)
        this.searching = false
        this.searchResults = []
      },
    })
  }

  selectResult(result: SearchResult): void {
    this.showSearchResults = false
    this.query = ""

    if (result.type === "reporte") {
      this.router.navigate(["/public/feed"], {
        queryParams: { reporte: result.id },
      })
    } else {
      if (result.id === this.currentUserId) {
        this.router.navigate(["/public/profile"])
      } else {
        this.router.navigate(["/public/user-profile", result.id])
      }
    }
  }

  closeSearch(): void {
    this.showSearchResults = false
  }

  getResultTitle(result: SearchResult): string {
    if (result.type === "reporte") {
      return result.titulo || "Reporte sin título"
    } else {
      return `${result.nombre || ""} ${result.apellido || ""}`.trim() || "Usuario"
    }
  }

  getResultSubtitle(result: SearchResult): string {
    if (result.type === "reporte") {
      return result.categoria || "Sin categoría"
    } else {
      return "Usuario de ComuniRed"
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "hace unos minutos"
    if (diffInHours < 24) return `hace ${diffInHours}h`
    if (diffInHours < 48) return "hace 1 día"
    return `hace ${Math.floor(diffInHours / 24)} días`
  }

  openNotifications(): void {
    this.router.navigate(["/public/notifications"])
    this.notificationCount = 0
  }

  // 4. Implementación de toggleTheme() usando ThemeService (Igual que AdminComponent)
  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDarkTheme();
  }

  goHome(): void {
    this.router.navigate(["/public/feed"])
  }

  trackByResult(index: number, result: SearchResult): string {
    return result.id
  }
}