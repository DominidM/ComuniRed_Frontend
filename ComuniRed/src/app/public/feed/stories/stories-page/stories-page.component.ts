import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { HistoriaService, Story } from '../../../../services/historia.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { VerHistoriaComponent, UserStoryGroup } from '../ver-historia/ver-historia.component';

@Component({
  selector: 'app-stories-page',
  standalone: true,
  imports: [CommonModule, RouterModule, VerHistoriaComponent],
  templateUrl: './stories-page.component.html',
  styleUrls: ['./stories-page.component.css'],
})
export class StoriesPageComponent implements OnInit, OnDestroy {
  currentGroup: UserStoryGroup | null = null;
  allGroups: UserStoryGroup[] = [];
  queueIndex = -1;
  loading = true;
  error = '';
  currentUserId: string | null = null;
  currentUserAvatar = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private historiaService: HistoriaService,
    private usuarioService: UsuarioService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const username = params.get('username') || '';
      this.cargarHistorias(username);
    });
  }

  ngOnDestroy(): void {}

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  @HostListener('document:keydown.arrowleft')
  onArrowLeft(): void {
    if (this.prevGroups.length > 0) this.goToUser(this.prevGroups[0]);
  }

  @HostListener('document:keydown.arrowright')
  onArrowRight(): void {
    if (this.nextGroups.length > 0) this.goToUser(this.nextGroups[0]);
  }

  private cargarHistorias(username: string): void {
    const storedUser = this.usuarioService.getUser() as any;
    const currentId = storedUser?.id || storedUser?._id;
    this.currentUserId = currentId || null;
    this.currentUserAvatar = storedUser?.foto_perfil || 'assets/img/default-avatar.png';
    this.error = '';

    if (!currentId) {
      this.error = 'Usuario no autenticado';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.historiaService
      .obtenerActivas(currentId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (stories) => {
          const normalized = this.normalize(stories);
          this.allGroups = this.agrupar(normalized);
          const idx = this.allGroups.findIndex(
            (g) => g.userName === username || g.userId === username,
          );
          if (idx >= 0) {
            this.queueIndex = idx;
            this.currentGroup = this.allGroups[idx];
          } else {
            this.error = `No hay historias de "${username}"`;
          }
        },
        error: () => {
          this.error = 'Error al cargar historias';
        },
      });
  }

  private normalize(raw: any[]): Story[] {
    return (raw ?? []).map((s) => ({
      id: s.id,
      userId: s.userId ?? s.usuarioId,
      userName: s.userName ?? 'Sin nombre',
      userAvatar: s.userAvatar ?? 'assets/img/default-avatar.png',
      text: s.text ?? s.texto ?? '',
      imageUrl: s.imageUrl ?? s.imagenUrl ?? '',
      videoUrl: s.videoUrl ?? '',
      bgColor: s.bgColor ?? s.colorFondo ?? '',
      timeAgo: s.timeAgo ?? s.fechaCreacion ?? '',
      seen: s.seen ?? s.vistaPorMi ?? false,
      categoryName: s.categoryName ?? '',
      categoryEmoji: s.categoryEmoji ?? '',
      duration: s.duration ?? s.duracion ?? 5,
      songTitle: s.cancionTitulo ?? s.songTitle ?? '',
      songArtist: s.cancionArtista ?? s.songArtist ?? '',
      songPreviewUrl: s.cancionPreviewUrl ?? s.songPreviewUrl ?? '',
      songCoverUrl: s.cancionCoverUrl ?? s.songCoverUrl ?? '',
    }));
  }

  private agrupar(stories: Story[]): UserStoryGroup[] {
    const map = new Map<string, Story[]>();
    for (const s of stories) {
      if (!map.has(s.userId)) map.set(s.userId, []);
      map.get(s.userId)!.push(s);
    }
    const groups: UserStoryGroup[] = [];
    for (const [userId, userStories] of map) {
      const first = userStories[0];
      groups.push({
        userId,
        userName: first.userName,
        userAvatar: first.userAvatar,
        stories: userStories.sort(
          (a, b) => new Date(a.timeAgo).getTime() - new Date(b.timeAgo).getTime(),
        ),
        allSeen: userStories.every((s) => s.seen),
        latestTime: userStories
          .reduce((latest, s) => {
            const t = new Date(s.timeAgo).getTime();
            return t > new Date(latest).getTime() ? s.timeAgo : latest;
          }, userStories[0].timeAgo),
      });
    }
    return groups.sort(
      (a, b) => new Date(b.latestTime).getTime() - new Date(a.latestTime).getTime(),
    );
  }

  get nextGroups(): UserStoryGroup[] {
    if (this.queueIndex < 0 || this.queueIndex >= this.allGroups.length - 1) return [];
    return this.allGroups.slice(this.queueIndex + 1);
  }

  get prevGroups(): UserStoryGroup[] {
    if (this.queueIndex <= 0) return [];
    return this.allGroups.slice(0, this.queueIndex).reverse();
  }

  goToUser(group: UserStoryGroup): void {
    this.router.navigate(['/stories', group.userName]);
  }

  close(): void {
    this.router.navigate(['/public/home']);
  }

  onViewerClose(): void {
    this.close();
  }

  onNavigateToUser(dir: 'prev' | 'next'): void {
    const groups = dir === 'next' ? this.nextGroups : this.prevGroups;
    if (groups.length > 0) {
      this.goToUser(groups[0]);
    }
  }

  onStoryDeleted(userId: string): void {
    const idx = this.allGroups.findIndex((g) => g.userId === userId);
    if (idx < 0) return;
    this.allGroups.splice(idx, 1);
    if (this.allGroups.length === 0) {
      this.close();
      return;
    }
    const nextIdx = Math.min(idx, this.allGroups.length - 1);
    this.queueIndex = nextIdx;
    this.currentGroup = this.allGroups[nextIdx];
  }
}
