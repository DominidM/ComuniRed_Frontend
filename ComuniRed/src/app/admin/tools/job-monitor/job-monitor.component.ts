import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceHeaderComponent } from '../../../shared/components/workspace-header/workspace-header.component';

@Component({
  selector: 'app-job-monitor',
  standalone: true,
  imports: [CommonModule, WorkspaceHeaderComponent],
  templateUrl: './job-monitor.component.html',
  styleUrl: './job-monitor.component.css'
})
export class JobMonitorComponent {

}
