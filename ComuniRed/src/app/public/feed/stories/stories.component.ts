import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { HistoriaService } from '../../../services/historia.service';

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  imageUrl?: string;
  text?: string;
  bgColor?: string;
  timeAgo: string;
  seen: boolean;
  categoryEmoji?: string;
  categoryName?: string;
  duration: number;
}

export interface UserStoryGroup {
  userId: string;
  userName: string;
  userAvatar: string;
  stories: Story[];
  allSeen: boolean;
  latestTime: string;
}

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  skeletonItems = [1, 2, 3];

  showLeftArrow = false;
  showRightArrow = true;

  // Modal crear
  showCreateModal = false;
  storyText = '';
  storyImagePreview: string | null = null;
  storyImageFile: File | null = null;
  publishingStory = false;
  selectedBg = 'linear-gradient(135deg, #c0392b, #e74c3c)';
  selectedDuration = 5;

  bgOptions = [
    'linear-gradient(135deg, #c0392b, #e74c3c)',
    'linear-gradient(135deg, #f39c12, #e67e22)',
    'linear-gradient(135deg, #2980b9, #3498db)',
    'linear-gradient(135deg, #27ae60, #2ecc71)',
    'linear-gradient(135deg, #8e44ad, #9b59b6)',
    'linear-gradient(135deg, #1a1a2e, #16213e)',
    'linear-gradient(135deg, #e91e63, #ff5722)',
    'linear-gradient(135deg, #00bcd4, #009688)',
  ];

  durationOptions = [
    { label: '5s', value: 5 },
    { label: '10s', value: 10 },
    { label: '15s', value: 15 },
  ];

  // Modal visor
  showViewerModal = false;
  activeGroup: UserStoryGroup | null = null;
  currentStoryIndex = 0;
  storyProgress = 0;
  storyAutoPlay = true;
  storyReplyText = '';
  quickReactions = ['❤️', '😮', '👍', '🙏', '😢'];

  private progressInterval: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private historiaService: HistoriaService,
  ) {}

  ngOnInit(): void {
    this.cargarHistorias();
  }

  ngOnDestroy(): void {
    this.clearProgressInterval();
  }

  get activeStory(): Story | null {
    if (!this.activeGroup) return null;
    return this.activeGroup.stories[this.currentStoryIndex] ?? null;
  }

  get hasMyStory(): boolean {
    return this.myActiveStories !== null;
  }

  get myLatestStory(): Story | null {
    return this.myActiveStories?.stories[0] ?? null;
  }

  private cargarHistorias(): void {
    if (!this.user?.id) return;
    this.loadingStories = true;
    this.historiaService
      .obtenerActivas(this.user.id)
      .pipe(
        finalize(() => {
          this.loadingStories = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (stories) => {
          const raw = stories ?? [];

          const normalized = raw.map((s: any) => ({
            id: s.id,
            userId: s.userId ?? s.usuarioId,
            userName: s.userName ?? 'Sin nombre',
            userAvatar: s.userAvatar ?? 'assets/img/default-avatar.png',
            text: s.text ?? s.texto ?? '',
            imageUrl: s.imageUrl ?? s.imagenUrl ?? '',
            bgColor: s.bgColor ?? s.colorFondo ?? '',
            timeAgo: s.timeAgo ?? s.fechaCreacion ?? '',
            seen: s.seen ?? s.vistaPorMi ?? false,
            categoryName: s.categoryName ?? '',
            categoryEmoji: s.categoryEmoji ?? '',
            duration: s.duration ?? s.duracion ?? 5,
          }));

          const groups = this.agruparPorUsuario(normalized);

          this.myActiveStories =
            groups.find((g) => g.userId === this.user?.id) ?? null;

          this.storyGroups = groups.filter(
            (g) => g.userId !== this.user?.id,
          );

          setTimeout(() => this.onTrackScroll(), 100);
        },
        error: (err) => console.error('Error cargando historias:', err),
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
        userId,
        userName: first.userName,
        userAvatar: first.userAvatar,
        stories: userStories.sort(
          (a, b) =>
            new Date(b.timeAgo).getTime() - new Date(a.timeAgo).getTime(),
        ),
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
    this.storiesTrack?.nativeElement.scrollBy({
      left: -220,
      behavior: 'smooth',
    });
    setTimeout(() => this.onTrackScroll(), 300);
  }

  scrollRight(): void {
    this.storiesTrack?.nativeElement.scrollBy({
      left: 220,
      behavior: 'smooth',
    });
    setTimeout(() => this.onTrackScroll(), 300);
  }

  openCreateStory(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.storyText = '';
    this.storyImagePreview = null;
    this.storyImageFile = null;
    this.selectedBg = this.bgOptions[0];
    this.selectedDuration = 5;
  }

  onStoryFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    if (file.size > 10 * 1024 * 1024) return;
    this.storyImageFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.storyImagePreview = e.target.result;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removeStoryFile(event: Event): void {
    event.stopPropagation();
    this.storyImageFile = null;
    this.storyImagePreview = null;
  }

  isStoryValid(): boolean {
    return !!(this.storyText.trim() || this.storyImageFile);
  }

  publishStory(): void {
    if (!this.isStoryValid() || !this.user?.id) return;
    this.publishingStory = true;

    this.historiaService
      .crear(
        this.user.id,
        this.storyText,
        this.storyImagePreview ? '' : this.selectedBg,
        this.selectedDuration,
        this.storyImageFile,
      )
      .pipe(
        finalize(() => {
          this.publishingStory = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (newStory) => {
          const existing = this.myActiveStories;
          if (existing) {
            existing.stories.unshift(newStory);
            existing.latestTime = newStory.timeAgo;
          } else {
            this.myActiveStories = {
              userId: this.user!.id!,
              userName: this.user!.name,
              userAvatar: this.user!.avatarUrl,
              stories: [newStory],
              allSeen: false,
              latestTime: newStory.timeAgo,
            };
          }
          this.closeCreateModal();
          this.storyPublished.emit();
        },
        error: (err) => console.error('Error publicando historia:', err),
      });
  }

  openMyStory(): void {
    if (this.myActiveStories) {
      this.activeGroup = this.myActiveStories;
      this.currentStoryIndex = 0;
      this.showViewerModal = true;
      this.storyProgress = 0;
      this.storyAutoPlay = true;
      this.startProgress();
    } else {
      this.openCreateStory();
    }
  }

  openStory(group: UserStoryGroup): void {
    this.activeGroup = group;
    this.currentStoryIndex = 0;
    this.showViewerModal = true;
    this.storyProgress = 0;
    this.storyAutoPlay = true;
    this.startProgress();

    this.marcarVistasPendientes();
  }

  private marcarVistasPendientes(): void {
    if (!this.activeGroup || !this.user?.id) return;
    const unviewed = this.activeGroup.stories.filter((s) => !s.seen);
    for (const story of unviewed) {
      story.seen = true;
      this.historiaService
        .marcarVista(story.id, this.user.id)
        .subscribe({ error: () => {} });
    }
    this.activeGroup.allSeen = this.activeGroup.stories.every((s) => s.seen);
  }

  closeViewer(): void {
    this.showViewerModal = false;
    this.activeGroup = null;
    this.currentStoryIndex = 0;
    this.storyReplyText = '';
    this.clearProgressInterval();
  }

  nextStory(event?: Event): void {
    event?.stopPropagation();
    if (!this.activeGroup) return;

    if (this.currentStoryIndex < this.activeGroup.stories.length - 1) {
      this.currentStoryIndex++;
      this.storyProgress = 0;
      this.startProgress();
    } else {
      this.closeViewer();
    }
  }

  prevStory(event?: Event): void {
    event?.stopPropagation();
    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
      this.storyProgress = 0;
      this.startProgress();
    }
  }

  toggleAutoPlay(): void {
    this.storyAutoPlay = !this.storyAutoPlay;
    if (this.storyAutoPlay) this.startProgress();
    else this.clearProgressInterval();
  }

  private startProgress(): void {
    this.clearProgressInterval();
    if (!this.storyAutoPlay) return;
    const duration = (this.activeStory?.duration || 5) * 1000;
    const steps = 100;
    const interval = duration / steps;

    this.progressInterval = setInterval(() => {
      this.storyProgress += 100 / steps;
      if (this.storyProgress >= 100) {
        this.storyProgress = 100;
        this.clearProgressInterval();
        setTimeout(() => this.nextStory(), 200);
      }
      this.cdr.detectChanges();
    }, interval);
  }

  private clearProgressInterval(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  sendStoryReply(): void {
    if (!this.storyReplyText.trim()) return;
    this.storyReplyText = '';
  }

  sendQuickReaction(emoji: string): void {}

  formatTime(fecha: string): string {
    if (!fecha) return '';
    const diff = (Date.now() - new Date(fecha).getTime()) / 1000;
    if (diff < 60) return 'ahora';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
    });
  }

  trackByGroupId(_index: number, group: UserStoryGroup): string {
    return group.userId;
  }
}
