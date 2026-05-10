import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService, Usuario } from '../../services/usuario.service';
import { SeguimientoService, Seguimiento } from '../../services/seguimiento.service';
import { QuejaService } from '../../services/queja.service';
import { ComentarioService } from '../../services/comentario.service';
import { ReaccionService } from '../../services/reaccion.service';

interface BannerOption {
  id: string;
  nombre: string;
  url: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentTab = 'actividad';
  private readonly DEFAULT_AVATAR = 'https://res.cloudinary.com/da4wxtjwu/image/upload/v1762842677/61e50034-ab7c-4dc5-9d75-7c27a2265cee.png';
  private readonly BANNER_KEY = 'comunired_profile_banner';

  // ── ViewChild para controlar el video directamente ────────
  @ViewChild('bannerVideoEl') bannerVideoEl!: ElementRef<HTMLVideoElement>;

  user: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    foto_perfil: string;
    fecha_registro: string | null;
  } | null = null;

  seguidoresCount = 0;
  seguidosCount = 0;
  loading = false;

  // Actividad
  misQuejas: any[] = [];
  quejasComentadas: any[] = [];
  cantidadQuejas = 0;
  cantidadComentarios = 0;
  cantidadReacciones = 0;
  loadingActividad = false;

  // Modales
  mostrarModalSeguidores = false;
  mostrarModalSeguidos = false;
  listaSeguidores: Usuario[] = [];
  listaSeguidos: Usuario[] = [];
  loadingModal = false;

  // ── Banner ────────────────────────────────────────────────
  editandoBanner = false;
  muteoBanner = true;

  bannerOptions: BannerOption[] = [
    {
      id: 'banner_ciudad',
      nombre: 'Ciudad',
      url: 'https://res.cloudinary.com/dp1vgjhsq/video/upload/v1776849628/YTDown.com_YouTube_Calling-Spider-Man-Across-the-Spider-Ver_Media_D5d5xinZI3E_001_1080p_krlnxi.mp4',
    },
    {
      id: 'banner_naturaleza',
      nombre: 'Naturaleza',
      url: 'https://res.cloudinary.com/dp1vgjhsq/video/upload/v1776849586/YTDown.com_YouTube_Jhayco-Holanda-Official-Video_Media_4KPbiiMcx1g_001_1080p_rkeq5o.mp4',
    },
    {
      id: 'banner_urbano',
      nombre: 'Urbano',
      url: 'https://res.cloudinary.com/dp1vgjhsq/video/upload/v1776926572/YTDown.com_YouTube_Trueno-FRESH-Official-Video_Media_mcJ-jFNARyg_001_1080p_fmvvcp.mp4',
    },
    {
      id: 'banner_comunidad',
      nombre: 'Comunidad',
      url: 'https://res.cloudinary.com/dp1vgjhsq/video/upload/v1776926786/YTDown.com_YouTube_Bad-Bunny-Neverita-Video-Oficial-Un-Vera_Media_ARWg160eaX4_001_480p_v4z1uc.mp4',
    },
    {
      id: 'banner_lima',
      nombre: 'Lima',
      url: 'https://res.cloudinary.com/dp1vgjhsq/video/upload/v1776927093/YTDown.com_YouTube_DUKI-Jhayco-RoCKSTAR-2-0-Video-Oficial_Media_cjmwG9aPGwM_001_1080p_ihlnvu.mp4',
    },
  ];

  bannerSeleccionado: BannerOption = this.bannerOptions[0];

  constructor(
    private usuarioService: UsuarioService,
    private seguimientoService: SeguimientoService,
    private quejaService: QuejaService,
    private comentarioService: ComentarioService,
    private reaccionService: ReaccionService,
    private router: Router
  ) {}
  ngOnDestroy(): void {
    const videoEl = this.bannerVideoEl?.nativeElement;
    if (videoEl) {
      videoEl.pause();
      videoEl.src = '';
      videoEl.load();
    }
  }
  ngOnInit(): void {
    const u = this.usuarioService.getUser();

    if (u) {
      this.user = {
        id: (u as any).id,
        nombre: (u as any).nombre || 'Usuario',
        apellido: (u as any).apellido || '',
        email: (u as any).email || 'correo@ejemplo.com',
        foto_perfil: (u as any).foto_perfil || this.DEFAULT_AVATAR,
        fecha_registro: (u as any).fecha_registro || null
      };

      this.cargarContadores();
      this.cargarActividad();
    } else {
      this.user = {
        id: '',
        nombre: 'Usuario',
        apellido: '',
        email: 'correo@ejemplo.com',
        foto_perfil: this.DEFAULT_AVATAR,
        fecha_registro: null
      };
    }

    this.restoreBanner();
  }

  // ── Banner methods ────────────────────────────────────────

  toggleEditBanner(): void {
    this.editandoBanner = !this.editandoBanner;
  }

  toggleMuteoBanner(): void {
    this.muteoBanner = !this.muteoBanner;
    // Aplicar directamente al elemento para que Angular no ignore el binding
    const videoEl = this.bannerVideoEl?.nativeElement;
    if (videoEl) videoEl.muted = this.muteoBanner;
  }

  seleccionarBanner(video: BannerOption): void {
    if (this.bannerSeleccionado.id === video.id) return; // ya está seleccionado

    // Pausar y limpiar el video actual antes de cambiar
    const videoEl = this.bannerVideoEl?.nativeElement;
    if (videoEl) {
      videoEl.pause();
      videoEl.src = '';       // fuerza que el browser suelte el stream anterior
      videoEl.load();
    }

    this.bannerSeleccionado = video;

    // Pequeño timeout para que Angular actualice el [src] y luego reproducir
    setTimeout(() => {
      const el = this.bannerVideoEl?.nativeElement;
      if (el) {
        el.src = video.url;
        el.muted = this.muteoBanner;
        el.load();
        el.play().catch(() => {});
      }
    }, 50);

    try {
      localStorage.setItem(this.BANNER_KEY, video.id);
    } catch {}
  }

  private restoreBanner(): void {
    try {
      const savedId = localStorage.getItem(this.BANNER_KEY);
      if (savedId) {
        const found = this.bannerOptions.find(b => b.id === savedId);
        if (found) this.bannerSeleccionado = found;
      }
    } catch {}
  }

  // ── Contadores ────────────────────────────────────────────

  cargarContadores(): void {
    if (!this.user?.id) return;
    this.loading = true;

    this.seguimientoService.contarSeguidores(this.user.id).subscribe({
      next: (count) => { this.seguidoresCount = count; },
      error: (err) => { console.error('Error contando seguidores:', err); }
    });

    this.seguimientoService.contarSeguidos(this.user.id).subscribe({
      next: (count) => { this.seguidosCount = count; this.loading = false; },
      error: (err) => { console.error('Error contando seguidos:', err); this.loading = false; }
    });
  }

  // ── Actividad ─────────────────────────────────────────────

  cargarActividad(): void {
    if (!this.user?.id) return;
    this.loadingActividad = true;

    this.quejaService.quejasPorUsuario(this.user.id, this.user.id).subscribe({
      next: (quejas: any[]) => {
        this.misQuejas = quejas || [];
        this.cantidadQuejas = quejas?.length || 0;
      },
      error: (err) => { console.error('Error cargando quejas:', err); this.misQuejas = []; }
    });

    this.comentarioService.obtenerReportesComentados(this.user.id, 0, 10).subscribe({
      next: (quejas: any[]) => {
        this.quejasComentadas = quejas;
        this.loadingActividad = false;
      },
      error: (err) => {
        console.error('Error cargando quejas comentadas:', err);
        this.quejasComentadas = [];
        this.loadingActividad = false;
      }
    });

    this.comentarioService.contarComentariosPorUsuario(this.user.id).subscribe({
      next: (count: number) => { this.cantidadComentarios = count; },
      error: (err) => { console.error('Error contando comentarios:', err); }
    });

    this.reaccionService.contarReaccionesPorUsuario(this.user.id).subscribe({
      next: (count: number) => { this.cantidadReacciones = count; },
      error: (err) => { console.error('Error contando reacciones:', err); this.cantidadReacciones = 0; }
    });
  }

  // ── Modales seguidores / seguidos ─────────────────────────

  verSeguidores(): void {
    if (!this.user?.id) return;
    this.mostrarModalSeguidores = true;
    this.loadingModal = true;
    this.listaSeguidores = [];

    this.seguimientoService.obtenerSeguidores(this.user.id, 0, 50).subscribe({
      next: (pageData: any) => {
        pageData.content.forEach((seg: Seguimiento) => {
          this.usuarioService.obtenerUsuarioPorId(seg.seguidorId).subscribe({
            next: (usuario) => { this.listaSeguidores.push(usuario); },
            error: (err) => { console.error('Error cargando seguidor:', err); }
          });
        });
        this.loadingModal = false;
      },
      error: (err) => { console.error('Error cargando seguidores:', err); this.loadingModal = false; }
    });
  }

  verSeguidos(): void {
    if (!this.user?.id) return;
    this.mostrarModalSeguidos = true;
    this.loadingModal = true;
    this.listaSeguidos = [];

    this.seguimientoService.obtenerSeguidos(this.user.id, 0, 50).subscribe({
      next: (pageData: any) => {
        pageData.content.forEach((seg: Seguimiento) => {
          this.usuarioService.obtenerUsuarioPorId(seg.seguidoId).subscribe({
            next: (usuario) => { this.listaSeguidos.push(usuario); },
            error: (err) => { console.error('Error cargando seguido:', err); }
          });
        });
        this.loadingModal = false;
      },
      error: (err) => { console.error('Error cargando seguidos:', err); this.loadingModal = false; }
    });
  }

  cerrarModal(): void {
    this.mostrarModalSeguidores = false;
    this.mostrarModalSeguidos = false;
  }

  dejarDeSeguir(usuario: Usuario): void {
    if (!this.user?.id) return;

    this.seguimientoService.dejarDeSeguir(this.user.id, usuario.id).subscribe({
      next: () => {
        this.listaSeguidos = this.listaSeguidos.filter(u => u.id !== usuario.id);
        this.seguidosCount--;
      },
      error: (err) => { console.error('Error dejando de seguir:', err); alert('Error al dejar de seguir'); }
    });
  }

  // ── Navegación ────────────────────────────────────────────

  verPerfil(usuario: Usuario): void {
    this.router.navigate(['/public/user-profile', usuario.id]);
  }

  verQueja(queja: any): void {
    this.router.navigate(['/public/feed/queja', queja.id]);
  }

  changeTab(tab: string): void {
    this.currentTab = tab;
  }

  // ── Helpers ───────────────────────────────────────────────

  obtenerFoto(foto_perfil?: string): string {
    if (!foto_perfil || foto_perfil.trim() === '') return this.DEFAULT_AVATAR;
    if (this.usuarioService.esFotoCloudinary(foto_perfil)) {
      return this.usuarioService.obtenerFotoMiniatura(foto_perfil, 48);
    }
    return foto_perfil;
  }
}