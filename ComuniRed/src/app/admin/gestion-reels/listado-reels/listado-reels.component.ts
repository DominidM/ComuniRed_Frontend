import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingOverlayComponent } from '../../../shared/components/loading/loading.component';
import { WorkspaceHeaderComponent } from '../../../shared/components/workspace-header/workspace-header.component';
import { ReelService, ReelResponse } from '../../../services/reel.service';

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
  selector: 'app-listado-reels',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingOverlayComponent,
    WorkspaceHeaderComponent
  ],
  templateUrl: './listado-reels.component.html',
  styleUrls: ['./listado-reels.component.css'],
})
export class ListadoReelsComponent implements OnInit {
  reels: Reel[] = [];
  filteredReels: Reel[] = [];
  loading = false;
  searchText = '';

  constructor(
    private reelService: ReelService,
    private router: Router
  ) {}

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
      error: () => {
        this.loading = false;
      },
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

  limpiarBusqueda(): void {
    this.searchText = '';
    this.loadReels();
  }

  crearNuevo(): void {
    this.router.navigate(['/admin/reels/nuevo']);
  }

  verDetalle(reel: Reel): void {
    this.router.navigate(['/admin/reels/detalle', reel.id]);
  }

  editar(reel: Reel): void {
    this.router.navigate(['/admin/reels/editar', reel.id]);
  }

  eliminar(reel: Reel): void {
    if (!confirm(`¿Eliminar reel "${reel.title}"?`)) return;

    this.reelService.eliminar(reel.id).subscribe({
      next: () => this.loadReels(),
    });
  }

  trackByReelId(_: number, reel: Reel): string {
    return reel.id;
  }
}