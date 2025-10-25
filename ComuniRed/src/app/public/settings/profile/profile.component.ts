import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-settings-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class SettingsProfileComponent implements OnInit {
  profileForm!: FormGroup;
  foto_perfil_url = 'assets/img/avatar-placeholder.png';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    const u = this.usuarioService.getUser();

    this.profileForm = this.fb.group({
      nombre: [u?.nombre || '', Validators.required],
      apellido: [u?.apellido || '', Validators.required],
      dni: [u?.dni || '', [Validators.required, Validators.minLength(8)]],
      telefono: [u?.numero_telefono || '', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      edad: [u?.edad || '', [Validators.required, Validators.min(1)]],
      sexo: [u?.sexo || '', Validators.required],
      ciudad: [u?.distrito || '', Validators.required],
      codigo_postal: [u?.codigo_postal || '', Validators.required],
      direccion: [u?.direccion || '', Validators.required],
      email: [u?.email || '', [Validators.required, Validators.email]],
      fecha_registro: [u?.fecha_registro || '', Validators.required],
    });

    this.foto_perfil_url = u?.foto_perfil || 'assets/img/avatar-placeholder.png';
  }

  save(): void {
    if (this.profileForm.valid) {
      const datosActualizados = this.profileForm.value;
      console.log('Guardar perfil:', datosActualizados);
      alert('Perfil actualizado (demo)');
    } else {
      alert('Por favor, completa todos los campos requeridos correctamente.');
    }
  }

  cancel(): void {
    const u = this.usuarioService.getUser();
    this.profileForm.reset({
      nombre: u?.nombre || '',
      apellido: u?.apellido || '',
      dni: u?.dni || '',
      telefono: u?.numero_telefono || '',
      edad: u?.edad || '',
      sexo: u?.sexo || '',
      ciudad: u?.distrito || '',
      codigo_postal: u?.codigo_postal || '',
      direccion: u?.direccion || '',
      email: u?.email || '',
      fecha_registro: u?.fecha_registro || '',
    });
  }
}
