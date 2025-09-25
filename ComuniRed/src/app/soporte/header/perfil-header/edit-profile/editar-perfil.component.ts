import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Usuario_soporte, Soporte } from '../../../ajson/json';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.css'],
})
export class EditarPerfilComponent implements OnInit {
  soporte!: Soporte;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.soporte = Usuario_soporte.find(u => u.id.toString() === id) || Usuario_soporte[0];
  }

  cambiarAvatar(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        this.soporte.avatar_soporte = reader.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  guardarCambios() {
    console.log('Usuario actualizado:', this.soporte);
    alert('Perfil actualizado con éxito ✅');
  }

  cancelar() {
    const original = Usuario_soporte.find(u => u.id === this.soporte.id) || Usuario_soporte[0];
    this.soporte = { ...original }; // Restablecer valores originales
    alert('Cambios cancelados ❌');
  }
}
