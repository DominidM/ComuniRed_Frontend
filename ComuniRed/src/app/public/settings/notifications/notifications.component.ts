import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class SettingsNotificationsComponent {
  email = true;
  push = false;
  sms = true;

  save() {
    alert('Configuración de notificaciones guardada (demo)');
  }
}
