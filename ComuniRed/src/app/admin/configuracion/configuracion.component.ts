import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, WorkspaceHeaderComponent],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css'
})
export class ConfiguracionComponent {

}
