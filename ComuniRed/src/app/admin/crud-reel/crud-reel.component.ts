import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingOverlayComponent } from '../../shared/components/loading/loading.component';
import { ReelService, ReelResponse } from '../../services/reel.service';

interface Reel {
  id: string;
  videoUrl: string;
  title: string;
  author: string;
  likes: number;
  comments: number;
  shares: number;
  description: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-crud-reel',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingOverlayComponent],
  templateUrl: './crud-reel.component.html',
  styleUrls: ['./crud-reel.component.css'],
})
export class CrudReelComponent implements OnInit {
  reels: Reel[] = [];
  filteredReels: Reel[] = [];
  loading = false;
  searchText = '';
  showModal = false;
  editingReel: Reel | null = null;

  formTitle = '';
  formDescription = '';
  formAuthor = '';
  formAuthorId = '';
  formAvatarUrl = '';
  selectedFile: File | null = null;
  submitting = false;

  constructor(private reelService: ReelService) {}

  ngOnInit(): void {
    this.loadReels();
  }

  loadReels(): void {
    this.loading = true;
    this.reelService.listarTodos(this.searchText || undefined).subscribe({
      next: (res) => {
        this.reels = this.mapReels(res);
        this.filteredReels = [...this.reels];
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  private mapReels(res: ReelResponse[]): Reel[] {
    return res.map((r) => ({
      id: r.id,
      videoUrl: r.videoUrl,
      title: r.title,
      author: r.author,
      likes: r.likes,
      comments: r.comentariosCount,
      shares: r.shares,
      description: r.description,
      avatarUrl: r.avatarUrl,
    }));
  }

  buscarReel(): void {
    this.loadReels();
  }

  openCreateModal(): void {
    this.editingReel = null;
    this.formTitle = '';
    this.formDescription = '';
    this.formAuthor = '';
    this.formAuthorId = '';
    this.formAvatarUrl = '';
    this.selectedFile = null;
    this.showModal = true;
  }

  openEditModal(reel: Reel): void {
    this.editingReel = reel;
    this.formTitle = reel.title;
    this.formDescription = reel.description;
    this.formAuthor = reel.author;
    this.formAuthorId = '';
    this.formAvatarUrl = reel.avatarUrl || '';
    this.selectedFile = null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingReel = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  guardar(): void {
    if (!this.formTitle || !this.formDescription || !this.formAuthor) return;
    if (!this.editingReel && !this.selectedFile) return;

    this.submitting = true;
    const fd = new FormData();
    fd.append('title', this.formTitle);
    fd.append('description', this.formDescription);
    fd.append('author', this.formAuthor);
    if (this.selectedFile) fd.append('video', this.selectedFile);
    if (this.formAvatarUrl) fd.append('avatarUrl', this.formAvatarUrl);
    if (!this.editingReel) {
      const user = JSON.parse(localStorage.getItem('usuario') || '{}') as any;
      fd.append('authorId', user?._id || user?.id || '');
    }

    const request = this.editingReel
      ? this.reelService.actualizar(this.editingReel.id, fd)
      : this.reelService.crear(fd);

    request.subscribe({
      next: () => {
        this.submitting = false;
        this.closeModal();
        this.loadReels();
      },
      error: () => (this.submitting = false),
    });
  }

  eliminar(reel: Reel): void {
    if (!confirm(`¿Eliminar reel "${reel.title}"?`)) return;
    this.reelService.eliminar(reel.id).subscribe({
      next: () => this.loadReels(),
    });
  }

  openViewModal(reel: Reel): void {
    this.selectedReel = reel;
    this.showViewModal = true;
  }

  selectedReel: Reel | null = null;
  showViewModal = false;

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedReel = null;
  }

  trackByReelId(_: number, reel: Reel): string {
    return reel.id;
  }
}
