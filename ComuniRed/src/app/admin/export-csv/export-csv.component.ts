import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';

@Component({
  selector: 'app-export-csv',
  standalone: true,
  imports: [CommonModule, WorkspaceHeaderComponent],
  templateUrl: './export-csv.component.html',
  styleUrl: './export-csv.component.css'
})
export class ExportCsvComponent {

}
