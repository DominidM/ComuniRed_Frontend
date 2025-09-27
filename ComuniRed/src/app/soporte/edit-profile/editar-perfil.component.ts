import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Usuario_soporte, Soporte } from '../json/json';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.css'],
})
export class EditarPerfilComponent implements OnInit {
  soporte: Soporte = Usuario_soporte[0] ;
  original!: Soporte;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.soporte =
      Usuario_soporte.find((u) => u.id.toString() === id) || Usuario_soporte[0];

    this.original = { ...this.soporte };
  }

  cambiarAvatar(event: Event) 
  {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) 
    {
      const reader = new FileReader();
      reader.onload = () => {
        this.soporte.avatar_soporte = reader.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  hayCambios(): boolean 
  {
    return JSON.stringify(this.soporte) !== JSON.stringify(this.original);
  }

  guardarCambios() {
    const index = Usuario_soporte.findIndex((u) => u.id === this.soporte.id);
    if (index !== -1) 
    {
      Usuario_soporte[index] = { ...this.soporte };
      this.original = { ...this.soporte }; 
      alert('Perfil actualizado con éxito');
    } 
    else {
      alert('No se encontró el usuario para actualizar');
    }
  }

  cancelar() {
    this.soporte = { ...this.original };
  }
}
5