import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceHeaderComponent } from '../../../shared/components/workspace-header/workspace-header.component';
import { ReelService, ReelResponse } from '../../../services/reel.service';

@Component({
  selector: 'app-detalle-reels',
  standalone: true,
  imports: [CommonModule, WorkspaceHeaderComponent],
  templateUrl: './detalle-reels.component.html',
  styleUrls: ['./detalle-reels.component.css'],
})
export class DetalleReelsComponent implements OnInit {
  reel: ReelResponse | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reelService: ReelService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/admin/reels']);
      return;
    }

    this.reelService.obtenerPorId(id).subscribe({
      next: (response) => {
        this.reel = response;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/admin/reels']);
      },
    });
  }

  volver(): void {
    this.router.navigate(['/admin/reels']);
  }

  editar(): void {
    if (!this.reel) return;
    this.router.navigate(['/admin/reels/editar', this.reel.id]);
  }
}