import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../../shared/services/change.service';

@Component({
  selector: 'app-help-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './help-contact.component.html',
})
export class HelpContactComponent {
  contactForm: FormGroup;
  selectedFiles: File[] = [];
  previews: string[] = [];
  enviando = false;

  constructor(private fb: FormBuilder, private alertService: AlertService) {
    this.contactForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      asunto: ['', Validators.required],
      mensaje: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        this.alertService.warning('Solo se permiten imágenes (JPG, PNG, GIF)');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.alertService.warning(`"${file.name}" supera el límite de 5MB`);
        continue;
      }
      this.selectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => this.previews.push(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previews.splice(index, 1);
  }

  async submit(): Promise<void> {
    if (this.contactForm.invalid) {
      this.alertService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const confirmado = await this.alertService.confirm(
      '¿Enviar mensaje?',
      '¿Estás seguro de que deseas enviar este mensaje al área de soporte?',
      'Sí, enviar',
      'Cancelar'
    );

    if (!confirmado) return;

    this.enviando = true;

    setTimeout(() => {
      this.enviando = false;
      this.contactForm.reset();
      this.selectedFiles = [];
      this.previews = [];
      this.alertService.success('Mensaje enviado correctamente. Te responderemos pronto.');
    }, 1500);
  }
}