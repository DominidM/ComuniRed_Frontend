import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceHeaderComponent } from '../../../shared/components/workspace-header/workspace-header.component';

@Component({
  selector: 'app-backups',
  standalone: true,
  imports: [CommonModule, WorkspaceHeaderComponent],
  templateUrl: './backups.component.html',
  styleUrl: './backups.component.css'
})
export class BackupsComponent {

}
