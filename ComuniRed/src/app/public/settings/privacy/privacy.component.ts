import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-privacy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css']
})
export class SettingsPrivacyComponent {
  showProfile = true;
  showActivity = false;

  save() {
    alert('Configuración de privacidad guardada (demo)');
  }
}
