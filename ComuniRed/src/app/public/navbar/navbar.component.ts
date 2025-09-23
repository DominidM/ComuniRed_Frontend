import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  activeTab: 'parati' | 'siguiendo' = 'parati';

  setTab(tab: 'parati' | 'siguiendo') {
    this.activeTab = tab;
  }
}