import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-settings",
  imports: [CommonModule],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.css",
})
export class SettingsComponent {
  currentTab = "actividad"

  changeTab(tab: string) {
    this.currentTab = tab
  }
}