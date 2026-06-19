import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceHeaderComponent } from '../../../shared/components/workspace-header/workspace-header.component';

@Component({
  selector: 'app-seed',
  standalone: true,
  imports: [CommonModule, WorkspaceHeaderComponent],
  templateUrl: './seed.component.html',
  styleUrl: './seed.component.css'
})
export class SeedComponent {

}
