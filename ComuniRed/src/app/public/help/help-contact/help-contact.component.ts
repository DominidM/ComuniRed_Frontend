import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  ChangeComponent,
  Alert,
  ConfirmDialog,
} from '../../../shared/components/change/change.component';
import { ModalStateService } from '../../../shared/services/modal-state.service';

@Component({
  selector: 'app-help-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ChangeComponent],
  templateUrl: './help-contact.component.html',
  styleUrls: ['./help-contact.component.css'],
})
export class HelpContactComponent implements OnDestroy {
  contactForm: FormGroup;
  selectedFiles: File[] = [];
  previews: string[] = [];
  enviando = false;

  alerts: Alert[] = [];
  confirmDialog: ConfirmDialog | null = null;

  constructor(
    private fb: FormBuilder,
    private modalState: ModalStateService,
  ) {
    this.contactForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      asunto: ['', Validators.required],
      mensaje: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnDestroy(): void {
    this.modalState.close();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        this.showAlert('warning', 'Solo se permiten imágenes (JPG, PNG, GIF)');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.showAlert('warning', `"${file.name}" supera el límite de 5MB`);
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

  submit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.showAlert(
        'warning',
        'Por favor, completa todos los campos correctamente.',
      );
      return;
    }

    this.confirmDialog = {
      title: '¿Enviar mensaje?',
      message:
        '¿Estás seguro de que deseas enviar este mensaje al área de soporte?',
      confirmText: 'Sí, enviar',
      cancelText: 'Cancelar',
    };
    this.modalState.open();
  }

  onConfirmSubmit(): void {
    this.confirmDialog = null;
    this.modalState.close();
    this.enviando = true;

    setTimeout(() => {
      this.enviando = false;
      this.contactForm.reset();
      this.selectedFiles = [];
      this.previews = [];
      this.showAlert(
        'success',
        'Mensaje enviado correctamente. Te responderemos pronto.',
      );
    }, 1500);
  }

  onCancelSubmit(): void {
    this.confirmDialog = null;
    this.modalState.close();
  }

  removeAlert(alert: Alert): void {
    this.alerts = this.alerts.filter((a) => a !== alert);
  }

  private showAlert(
    type: Alert['type'],
    message: string,
    duration = 4000,
  ): void {
    const alert: Alert = { type, message, duration };
    this.alerts.push(alert);

    setTimeout(() => {
      this.removeAlert(alert);
    }, duration);
  }
}
