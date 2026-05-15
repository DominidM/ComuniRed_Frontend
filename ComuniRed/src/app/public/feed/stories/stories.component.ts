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
  myActiveStory: Story | null = null;

  stories: Story[] = [];
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
  activeStory: Story | null = null;
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

  // ─── Carga inicial ─────────────────────────────────────────────
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

          const seen = new Set<string>();
          const deduped = normalized.filter((s: Story) => {
            const key = `${s.userId}|${s.text}|${s.imageUrl}|${s.bgColor}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          this.myActiveStory =
            deduped.find((s: Story) => s.userId === this.user?.id) ?? null;
          this.stories = deduped.filter(
            (s: Story) => s.userId !== this.user?.id,
          );

          setTimeout(() => this.onTrackScroll(), 100);
        },
        error: (err) => console.error('Error cargando historias:', err),
      });
  }

  truncateName(name: string | undefined): string {
    if (!name) return '';
    return name.length > 10 ? name.slice(0, 10) + '…' : name;
  }
  // ─── Scroll ────────────────────────────────────────────────────
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

  // ─── Crear historia ────────────────────────────────────────────
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
          this.myActiveStory = newStory;
          this.closeCreateModal();
          this.storyPublished.emit();
        },
        error: (err) => console.error('Error publicando historia:', err),
      });
  }

  // Agrega este método para abrir tu propia historia
  openMyStory(): void {
    if (this.myActiveStory) {
      this.activeStory = this.myActiveStory;
      this.currentStoryIndex = -1; // índice especial: es mi historia
      this.showViewerModal = true;
      this.storyProgress = 0;
      this.storyAutoPlay = true;
      this.startProgress();
    } else {
      this.openCreateStory();
    }
  }
  // ─── Visor ─────────────────────────────────────────────────────
  openStory(story: Story): void {
    this.currentStoryIndex = this.stories.findIndex((s) => s.id === story.id);
    this.activeStory = story;
    this.showViewerModal = true;
    this.storyProgress = 0;
    this.storyAutoPlay = true;
    this.startProgress();

    if (!story.seen && this.user?.id) {
      story.seen = true;
      this.historiaService
        .marcarVista(story.id, this.user.id)
        .subscribe({ error: (e) => console.warn('marcarVista error:', e) });
    }
  }

  closeViewer(): void {
    this.showViewerModal = false;
    this.activeStory = null;
    this.storyReplyText = '';
    this.clearProgressInterval();
  }

  nextStory(event?: Event): void {
    event?.stopPropagation();
    if (this.currentStoryIndex < this.stories.length - 1) {
      this.currentStoryIndex++;
      this.activeStory = this.stories[this.currentStoryIndex];
      this.storyProgress = 0;
      this.startProgress();
      // Marcar vista
      if (!this.activeStory.seen && this.user?.id) {
        this.activeStory.seen = true;
        this.historiaService
          .marcarVista(this.activeStory.id, this.user.id)
          .subscribe();
      }
    } else {
      this.closeViewer();
    }
  }

  prevStory(event?: Event): void {
    event?.stopPropagation();
    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
      this.activeStory = this.stories[this.currentStoryIndex];
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
    // TODO: integrar con servicio de mensajes cuando esté disponible
    this.storyReplyText = '';
  }

  sendQuickReaction(emoji: string): void {
  }

  trackByStoryId(_index: number, story: Story): string {
    return story.id;
  }

  // Reemplaza el bloque "Tu historia" en el HTML — en el TS agrega este getter
  get hasMyStory(): boolean {
    return this.myActiveStory !== null;
  }
}
