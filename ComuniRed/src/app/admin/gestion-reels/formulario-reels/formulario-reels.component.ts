import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceHeaderComponent } from '../../../shared/components/workspace-header/workspace-header.component';
import { ReelService } from '../../../services/reel.service';

@Component({
  selector: 'app-formulario-reels',
  standalone: true,
  imports: [CommonModule, FormsModule, WorkspaceHeaderComponent],
  templateUrl: './formulario-reels.component.html',
  styleUrls: ['./formulario-reels.component.css'],
})
export class FormularioReelsComponent implements OnInit {
  reelId: string | null = null;
  isEditing = false;

  formTitle = '';
  formDescription = '';
  formAuthor = '';
  formAvatarUrl = '';
  selectedFile: File | null = null;
  selectedFileName = '';
  submitting = false;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reelService: ReelService
  ) {}

  ngOnInit(): void {
    this.reelId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.reelId;

    if (this.isEditing && this.reelId) {
      this.cargarReel(this.reelId);
    }
  }

  cargarReel(id: string): void {
    this.loading = true;
    this.reelService.obtenerPorId(id).subscribe({
      next: (reel) => {
        this.formTitle = reel.title;
        this.formDescription = reel.description;
        this.formAuthor = reel.author;
        this.formAvatarUrl = reel.avatarUrl || '';
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/admin/reels']);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.selectedFileName = this.selectedFile?.name || '';
  }

  guardar(): void {
    if (!this.formTitle.trim() || !this.formDescription.trim() || !this.formAuthor.trim()) return;
    if (!this.isEditing && !this.selectedFile) return;

    this.submitting = true;

    const fd = new FormData();
    fd.append('title', this.formTitle.trim());
    fd.append('description', this.formDescription.trim());
    fd.append('author', this.formAuthor.trim());

    if (this.selectedFile) {
      fd.append('video', this.selectedFile);
    }

    if (this.formAvatarUrl.trim()) {
      fd.append('avatarUrl', this.formAvatarUrl.trim());
    }

    if (!this.isEditing) {
      const user = JSON.parse(localStorage.getItem('usuario') || '{}') as any;
      fd.append('authorId', user?._id || user?.id || '');
    }

    const request =
      this.isEditing && this.reelId
        ? this.reelService.actualizar(this.reelId, fd)
        : this.reelService.crear(fd);

    request.subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/admin/reels']);
      },
      error: () => {
        this.submitting = false;
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin/reels']);
  }
}