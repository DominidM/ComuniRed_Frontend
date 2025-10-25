import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, type FormGroup, Validators, FormsModule } from "@angular/forms"

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
})
export class SettingsProfileComponent implements OnInit {
  profileForm!: FormGroup
  foto_perfil_url = "assets/img/avatar-placeholder.png"

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      nombre: ["Juan Pérez", Validators.required],
      email: ["juan@email.com", [Validators.required, Validators.email]],
      telefono: ["+52 123 456 7890", Validators.required],
      ciudad: ["Ciudad de México", Validators.required],
      biografia: ["Cuéntanos sobre ti...", Validators.required],
    })
  }

  save(): void {
    if (this.profileForm.valid) {
      const datosActualizados = this.profileForm.value
      console.log("Perfil actualizado:", datosActualizados)
      alert("Perfil actualizado correctamente")
    } else {
      alert("Por favor, completa todos los campos requeridos correctamente.")
    }
  }

  cancel(): void {
    this.profileForm.reset({
      nombre: "Juan Pérez",
      email: "juan@email.com",
      telefono: "+52 123 456 7890",
      ciudad: "Ciudad de México",
      biografia: "Cuéntanos sobre ti...",
    })
  }
}