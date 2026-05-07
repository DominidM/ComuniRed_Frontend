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
import { HistoriaService } from '../../services/historia.service';

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
          console.log('📋 Campo raw de la primera historia:', stories[0]);
          this.stories = (stories ?? []).map((s: any) => ({
            ...s,
            userName:
              s.userName ?? s.nombre ?? s.name ?? s.autorNombre ?? 'Sin nombre',
            userAvatar: s.userAvatar ?? s.avatar ?? s.avatarUrl ?? s.foto ?? '',
            text: s.text ?? s.texto ?? '',
            imageUrl: s.imageUrl ?? s.imagenUrl ?? '',
            bgColor: s.bgColor ?? s.colorFondo ?? '',
            categoryName: s.categoryName ?? '',
            categoryEmoji: s.categoryEmoji ?? '',
          }));
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
          this.stories = [newStory, ...this.stories];
          this.closeCreateModal();
          this.storyPublished.emit();
        },
        error: (err) => console.error('Error publicando historia:', err),
      });
  }

  // ─── Visor ─────────────────────────────────────────────────────
  openStory(story: Story): void {
    this.currentStoryIndex = this.stories.findIndex((s) => s.id === story.id);
    this.activeStory = story;
    this.showViewerModal = true;
    this.storyProgress = 0;
    this.storyAutoPlay = true;
    this.startProgress();

    // Marcar como vista en el backend (fire-and-forget)
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
    console.log('Reply to story:', this.activeStory?.id, this.storyReplyText);
    this.storyReplyText = '';
  }

  sendQuickReaction(emoji: string): void {
    // TODO: integrar con servicio de reacciones cuando esté disponible
    console.log('Quick reaction:', emoji, 'to story:', this.activeStory?.id);
  }

  trackByStoryId(_index: number, story: Story): string {
    return story.id;
  }
}
