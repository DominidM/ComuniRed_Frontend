import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Breadcrumb {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-workspace-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './workspace-header.component.html',
  styleUrls: ['./workspace-header.component.css'],
})
export class WorkspaceHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() breadcrumbs: Breadcrumb[] = [];
  @Input() count: number | null = null;
  @Input() countLabel = 'registros';
  @Input() actionLabel = '';
  @Input() actionIcon = '+';
  @Input() secondaryActionLabel = '';
  @Input() secondaryActionIcon = '';
  @Input() loading = false;

  @Output() actionClick = new EventEmitter<void>();
  @Output() secondaryActionClick = new EventEmitter<void>();
}