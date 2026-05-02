import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuejaService } from '../../../services/queja.service';
import { CategoriaService, Categoria } from '../../../services/categoria.service';

@Component({
  selector: 'app-create-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-report.component.html',
  styleUrls: ['./create-report.component.css']
})
export class CreateReportComponent implements OnInit {
  @Input() user: { id?: string; name: string; avatarUrl: string } | null = null;
  @Input() categorias: Categoria[] = [];

  @Output() created   = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  loading = false;

  form = {
    titulo: '',
    descripcion: '',
    categoriaId: '',
    ubicacion: '',
    imagenFile: null as File | null,
    imagenPreview: null as string | null,
  };

  isValid(): boolean {
    return !!(this.form.titulo.trim() && this.form.descripcion.trim() && this.form.categoriaId);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) { alert('La imagen no debe superar 5MB'); return; }
    if (!file.type.startsWith('image/')) { alert('Solo se permiten imágenes'); return; }
    this.form.imagenFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => { this.form.imagenPreview = e.target.result; };
    reader.readAsDataURL(file);
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.form.imagenFile = null;
    this.form.imagenPreview = null;
  }

  constructor(private quejaService: QuejaService) {}

  ngOnInit(): void {}

  submit(): void {
    if (!this.isValid() || !this.user?.id) return;
    this.loading = true;

    this.quejaService.crearQueja(
      this.form.titulo,
      this.form.descripcion,
      this.form.categoriaId,
      this.user.id,
      this.form.ubicacion || undefined,
      this.form.imagenFile || undefined,
    ).subscribe({
      next: () => { this.loading = false; this.created.emit(); },
      error: () => { this.loading = false; }
    });
  }
}