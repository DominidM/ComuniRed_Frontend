import { Component } from '@angular/core';

@Component({
  selector: 'app-notifications',
  imports: [],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {
  notifications = [
    {
      icon: 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png',
      text: 'Solo',
      time: '10 minutos'
    },
    {
      icon: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
      text: 'Hola Prueba 1.',
      time: '3 horas'
    },
    {
      icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968841.png',
      text: 'Sola',
      time: '4 horas'
    },
    {
      icon: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
      text: 'Hola',
      time: '4 horas'
    }
  ];
}
