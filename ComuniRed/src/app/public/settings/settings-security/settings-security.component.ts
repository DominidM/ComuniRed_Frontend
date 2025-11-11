import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-security',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-security.component.html',
  styleUrls: ['./settings-security.component.css']
})
export class SettingsSecurityComponent {
  twoFactor = false;
  guardando = false;

  cancel() {
    this.twoFactor = false;
  }

  save() {
    this.guardando = true;

    setTimeout(() => {
      this.guardando = false;
      alert('Configuración de seguridad guardada exitosamente');
    }, 1500);
  }
}
