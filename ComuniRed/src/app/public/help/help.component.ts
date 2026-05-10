import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpFaqComponent } from './help-faq/help-faq.component';
import { HelpContactComponent } from './help-contact/help-contact.component';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, HelpFaqComponent, HelpContactComponent],
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css'],
})
export class HelpComponent {
  activeTab: 'faq' | 'contact' = 'faq';

  setTab(tab: 'faq' | 'contact'): void {
    this.activeTab = tab;
  }
}