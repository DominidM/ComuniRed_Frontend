import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceHeaderComponent } from '../../../shared/components/workspace-header/workspace-header.component';

@Component({
  selector: 'app-exports-history',
  standalone: true,
  imports: [CommonModule, WorkspaceHeaderComponent],
  templateUrl: './exports-history.component.html',
  styleUrl: './exports-history.component.css'
})
export class ExportsHistoryComponent {

}
