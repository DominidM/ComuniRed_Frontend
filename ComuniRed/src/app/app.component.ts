import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChangeComponent } from './shared/components/change/change.component';
import { AlertComponent } from './shared/components/alert/alert.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChangeComponent, AlertComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ComuniRed';

}