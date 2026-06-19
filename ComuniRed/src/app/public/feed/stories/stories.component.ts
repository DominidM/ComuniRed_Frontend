import {
  Component, OnInit, OnDestroy, Input, Output, EventEmitter,
  ViewChild, ElementRef, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { HistoriaService, Story } from '../../../services/historia.service';
import { UserStoryGroup } from './ver-historia/ver-historia.component';
import { ModalStateService } from '../../../shared/services/modal-state.service';

export type { Story };

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stories.component.html',
  styleUrls: ['./stories.component.css'],
})
export class StoriesComponent implements OnInit, OnDestroy {
  @Input() user: { id?: string; name: string; avatarUrl: string } | null = null;
  @Output() storyPublished = new EventEmitter<void>();

  @ViewChild('storiesTrack') storiesTrack!: ElementRef<HTMLDivElement>;

  myActiveStories: UserStoryGroup | null = null;
  storyGroups: UserStoryGroup[] = [];
  loadingStories = false;
  skeletonItems = [1, 2, 3, 4];
  showLeftArrow = false;
  showRightArrow = true;

  private storyCreatedSub?: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private historiaService: HistoriaService,
    private router: Router,
    private modalState: ModalStateService,
  ) {}

  ngOnInit(): void {
    this.cargarHistorias();
    this.storyCreatedSub = this.modalState.storyCreated$.subscribe((story) => {
      this.onStoryCreated(story);
    });
  }

  ngOnDestroy(): void {
    this.storyCreatedSub?.unsubscribe();
  }

  get hasMyStory(): boolean {
    return this.myActiveStories !== null;
  }

  private cargarHistorias(): void {
    if (!this.user?.id) return;
    this.loadingStories = true;
    this.historiaService
      .obtenerActivas(this.user.id)
      .pipe(finalize(() => {
        this.loadingStories = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (stories) => {
          const normalized = (stories ?? []).map((s: any) => ({
            id: s.id, userId: s.userId ?? s.usuarioId,
            userName: s.userName ?? 'Sin nombre',
            userAvatar: s.userAvatar ?? 'assets/img/default-avatar.png',
            text: s.text ?? s.texto ?? '',
            imageUrl: s.imageUrl ?? s.imagenUrl ?? '',
            videoUrl: s.videoUrl ?? '',
            bgColor: s.bgColor ?? s.colorFondo ?? '',
            timeAgo: s.timeAgo ?? s.fechaCreacion ?? '',
            seen: s.seen ?? s.vistaPorMi ?? false,
            categoryName: s.categoryName ?? '', categoryEmoji: s.categoryEmoji ?? '',
            duration: s.duration ?? s.duracion ?? 5,
            songTitle: s.cancionTitulo ?? s.songTitle ?? '',
            songArtist: s.cancionArtista ?? s.songArtist ?? '',
            songPreviewUrl: s.cancionPreviewUrl ?? s.songPreviewUrl ?? '',
            songCoverUrl: s.cancionCoverUrl ?? s.songCoverUrl ?? '',
          }));
          const groups = this.agruparPorUsuario(normalized);
          this.myActiveStories = groups.find((g) => g.userId === this.user?.id) ?? null;
          this.storyGroups = groups.filter((g) => g.userId !== this.user?.id);
          setTimeout(() => this.onTrackScroll(), 100);
        },
        error: () => this.loadingStories = false,
      });
  }

  private agruparPorUsuario(stories: Story[]): UserStoryGroup[] {
    const map = new Map<string, Story[]>();
    for (const s of stories) {
      if (!map.has(s.userId)) map.set(s.userId, []);
      map.get(s.userId)!.push(s);
    }
    const groups: UserStoryGroup[] = [];
    for (const [userId, userStories] of map) {
      const first = userStories[0];
      groups.push({
        userId, userName: first.userName, userAvatar: first.userAvatar,
        stories: userStories.sort((a, b) => new Date(a.timeAgo).getTime() - new Date(b.timeAgo).getTime()),
        allSeen: userStories.every((s) => s.seen),
        latestTime: userStories.reduce((latest, s) => {
          const t = new Date(s.timeAgo).getTime();
          return t > new Date(latest).getTime() ? s.timeAgo : latest;
        }, userStories[0].timeAgo),
      });
    }
    return groups;
  }

  truncateName(name: string | undefined): string {
    if (!name) return '';
    return name.length > 10 ? name.slice(0, 10) + '…' : name;
  }

  onTrackScroll(): void {
    const el = this.storiesTrack?.nativeElement;
    if (!el) return;
    this.showLeftArrow = el.scrollLeft > 10;
    this.showRightArrow = el.scrollLeft + el.clientWidth < el.scrollWidth - 10;
  }

  scrollLeft(): void {
    this.storiesTrack?.nativeElement.scrollBy({ left: -220, behavior: 'smooth' });
    setTimeout(() => this.onTrackScroll(), 300);
  }

  scrollRight(): void {
    this.storiesTrack?.nativeElement.scrollBy({ left: 220, behavior: 'smooth' });
    setTimeout(() => this.onTrackScroll(), 300);
  }

  openCreateStory(): void {
    if (!this.user) return;
    this.modalState.openCreateStory(this.user);
  }

  onStoryCreated(story: Story): void {
    if (this.myActiveStories) {
      this.myActiveStories.stories.unshift(story);
      this.myActiveStories.latestTime = story.timeAgo;
    } else if (this.user) {
      this.myActiveStories = {
        userId: this.user.id!, userName: this.user.name,
        userAvatar: this.user.avatarUrl,
        stories: [story], allSeen: false, latestTime: story.timeAgo,
      };
    }
    this.storyPublished.emit();
  }

  openStory(group: UserStoryGroup): void {
    this.router.navigate(['/stories', group.userName]);
  }

  trackByGroupId(_index: number, group: UserStoryGroup): string {
    return group.userId;
  }
}
