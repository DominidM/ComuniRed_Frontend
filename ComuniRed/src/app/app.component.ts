import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageNotificationComponent } from './shared/components/message-notification/message-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MessageNotificationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ComuniRed';
}