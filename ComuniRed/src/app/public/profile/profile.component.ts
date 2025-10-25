import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { UsuarioService } from "../../services/usuario.service";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"]
})
export class ProfileComponent {
  currentTab = "actividad"

  user: { nombre: string; apellido: string; email: string; foto_perfil: string } | null = null;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    const u = this.usuarioService.getUser();

    if (u) {
      this.user = {
        nombre: (u as any).nombre || "Usuario",
        apellido: (u as any).apellido || "",
        email: (u as any).email || "correo@ejemplo.com",
        foto_perfil: (u as any).foto_perfil || "assets/img/default-avatar.png"
      };
    } else {
      this.user = {
        nombre: "Usuario",
        apellido: "",
        email: "correo@ejemplo.com",
        foto_perfil: "assets/img/default-avatar.png"
      };
    }
  }


  changeTab(tab: string) {
    this.currentTab = tab
  }
}