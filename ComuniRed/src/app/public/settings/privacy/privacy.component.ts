import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface PrivacySetting {
  id: string
  titulo: string
  descripcion: string
  activo: boolean
}

@Component({
  selector: "app-privacy",
  imports: [CommonModule, FormsModule],
  templateUrl: "./privacy.component.html",
  styleUrl: "./privacy.component.css",
})
export class SettingsPrivacyComponent {
  privacySettings: PrivacySetting[] = [
    {
      id: "public-profile",
      titulo: "Perfil Público",
      descripcion: "Permite que otros vean tu perfil",
      activo: true,
    },
    {
      id: "show-email",
      titulo: "Mostrar Email",
      descripcion: "Muestra tu email en tu perfil público",
      activo: false,
    },
    {
      id: "show-location",
      titulo: "Mostrar Ubicación",
      descripcion: "Permite que otros vean tu ubicación general",
      activo: true,
    },
  ]

  togglePrivacy(id: string): void {
    const setting = this.privacySettings.find((s) => s.id === id)
    if (setting) {
      setting.activo = !setting.activo
    }
  }

  save(): void {
    console.log("Cambios de privacidad guardados:", this.privacySettings)
  }

  cancel(): void {
    console.log("Cambios cancelados")
  }
}