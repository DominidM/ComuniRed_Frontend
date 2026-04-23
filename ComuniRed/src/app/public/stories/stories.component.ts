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
  duration: number; // segundos
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

  // Lista de historias (mock - reemplazar con servicio real)
  stories: Story[] = [
    {
      id: '1',
      userId: 'u1',
      userName: 'Ana López',
      userAvatar: 'assets/img/default-avatar.png',
      imageUrl: '',
      text: 'Bache enorme en la Av. Javier Prado altura cdra 12 🚧',
      bgColor: 'linear-gradient(135deg, #c0392b, #e74c3c)',
      timeAgo: 'hace 2h',
      seen: false,
      categoryEmoji: '🚧',
      categoryName: 'Vías',
      duration: 5,
    },
    {
      id: '2',
      userId: 'u2',
      userName: 'Carlos Ríos',
      userAvatar: 'assets/img/default-avatar.png',
      text: 'Sin luz desde ayer en Surco ⚡',
      bgColor: 'linear-gradient(135deg, #f39c12, #e67e22)',
      timeAgo: 'hace 14m',
      seen: false,
      categoryEmoji: '💡',
      categoryName: 'Alumbrado',
      duration: 5,
    },
    {
      id: '3',
      userId: 'u3',
      userName: 'María Vega',
      userAvatar: 'assets/img/default-avatar.png',
      text: 'Agua cortada en Miraflores toda la mañana 💧',
      bgColor: 'linear-gradient(135deg, #2980b9, #3498db)',
      timeAgo: 'hace 1h',
      seen: true,
      categoryEmoji: '💧',
      categoryName: 'Agua',
      duration: 5,
    },
    {
      id: '4',
      userId: 'u4',
      userName: 'José Paredes',
      userAvatar: 'assets/img/default-avatar.png',
      text: 'Desmonte abandonado en calle Las Flores 🗑️',
      bgColor: 'linear-gradient(135deg, #27ae60, #2ecc71)',
      timeAgo: 'hace 3h',
      seen: true,
      categoryEmoji: '🗑️',
      categoryName: 'Limpieza',
      duration: 5,
    },
    {
      id: '5',
      userId: 'u5',
      userName: 'Luisa Torres',
      userAvatar: 'assets/img/default-avatar.png',
      text: 'Semáforo sin funcionar en cruce peligroso 🚦',
      bgColor: 'linear-gradient(135deg, #8e44ad, #9b59b6)',
      timeAgo: 'hace 5h',
      seen: false,
      categoryEmoji: '🚦',
      categoryName: 'Señalización',
      duration: 5,
    },
  ];

  loadingStories = false;
  skeletonItems = [1, 2, 3];

  // Scroll arrows
  showLeftArrow = false;
  showRightArrow = true;

  // Modal crear historia
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

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.clearProgressInterval();
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

  // ─── Crear historia ───────────────────────────────────────────
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
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 10 * 1024 * 1024) return; // 10MB max
      this.storyImageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.storyImagePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
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
    if (!this.isStoryValid()) return;
    this.publishingStory = true;

    // Simular publicación (reemplazar con servicio real)
    setTimeout(() => {
      const newStory: Story = {
        id: 'new-' + Date.now(),
        userId: this.user?.id || '',
        userName: this.user?.name || 'Tú',
        userAvatar: this.user?.avatarUrl || 'assets/img/default-avatar.png',
        imageUrl: this.storyImagePreview || '',
        text: this.storyText,
        bgColor: this.storyImagePreview ? undefined : this.selectedBg,
        timeAgo: 'ahora',
        seen: false,
        duration: this.selectedDuration,
      };

      this.stories = [newStory, ...this.stories];
      this.publishingStory = false;
      this.closeCreateModal();
      this.storyPublished.emit();
      this.cdr.detectChanges();
    }, 1200);
  }

  // ─── Visor de historias ───────────────────────────────────────
  openStory(story: Story): void {
    this.currentStoryIndex = this.stories.findIndex((s) => s.id === story.id);
    this.activeStory = story;
    this.showViewerModal = true;
    story.seen = true;
    this.storyProgress = 0;
    this.storyAutoPlay = true;
    this.startProgress();
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
      this.activeStory.seen = true;
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
    // Aquí se integraría con el servicio de mensajes
    console.log('Reply to story:', this.activeStory?.id, this.storyReplyText);
    this.storyReplyText = '';
  }

  sendQuickReaction(emoji: string): void {
    console.log('Quick reaction:', emoji, 'to story:', this.activeStory?.id);
  }

  trackByStoryId(index: number, story: Story): string {
    return story.id;
  }
}