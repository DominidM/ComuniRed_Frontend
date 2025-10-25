import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-settings",
  imports: [CommonModule],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.css",
})
export class ProfileComponent {
  currentTab = "actividad"

  changeTab(tab: string) {
    this.currentTab = tab
  }
}