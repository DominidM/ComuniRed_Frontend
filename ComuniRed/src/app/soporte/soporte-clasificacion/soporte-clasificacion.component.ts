import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reporte, REPORTES } from '../json/json';

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
  total: number;
}

@Component({
  selector: 'app-clasificacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './soporte-clasificacion.component.html',
  styleUrls: ['./soporte-clasificacion.component.css']
})
export class SoporteClasificacionComponent implements OnInit {
  reportes: Reporte[] = [];
  categorias: Categoria[] = [
    {
      id: 'infraestructura',
      nombre: 'Infraestructura',
      descripcion: 'Problemas con calles, veredas, alumbrado',
      color: '#3b82f6',
      icono: '🏗️',
      total: 0
    },
    {
      id: 'servicios',
      nombre: 'Servicios Públicos',
      descripcion: 'Agua, luz, limpieza pública',
      color: '#10b981',
      icono: '💧',
      total: 0
    },
    {
      id: 'seguridad',
      nombre: 'Seguridad',
      descripcion: 'Robos, vandalismo, iluminación',
      color: '#ef4444',
      icono: '🚨',
      total: 0
    },
    {
      id: 'medio_ambiente',
      nombre: 'Medio Ambiente',
      descripcion: 'Contaminación, áreas verdes',
      color: '#22c55e',
      icono: '🌱',
      total: 0
    },
    {
      id: 'transporte',
      nombre: 'Transporte',
      descripcion: 'Tráfico, señalización, transporte público',
      color: '#f59e0b',
      icono: '🚗',
      total: 0
    },
    {
      id: 'otros',
      nombre: 'Otros',
      descripcion: 'Reportes sin categoría específica',
      color: '#6b7280',
      icono: '📋',
      total: 0
    }
  ];

  categoriaSeleccionada: string = '';
  reportesFiltrados: Reporte[] = [];
  busqueda: string = '';

  ngOnInit(): void {
    this.reportes = REPORTES;
    this.calcularTotales();
    this.reportesFiltrados = [...this.reportes];
  }

  calcularTotales(): void {
    this.categorias.forEach(cat => {
      cat.total = this.reportes.filter(r => r.tipo?.toLowerCase() === cat.id).length;
    });

    const sinCategoria = this.reportes.filter(r => !r.tipo || r.tipo === '').length;
    const otrosCategoria = this.categorias.find(c => c.id === 'otros');
    if (otrosCategoria) {
      otrosCategoria.total += sinCategoria;
    }
  }

  seleccionarCategoria(categoriaId: string): void {
    if (this.categoriaSeleccionada === categoriaId) {
      this.categoriaSeleccionada = '';
      this.reportesFiltrados = [...this.reportes];
    } else {
      this.categoriaSeleccionada = categoriaId;
      this.reportesFiltrados = this.reportes.filter(r => 
        r.tipo?.toLowerCase() === categoriaId || (!r.tipo && categoriaId === 'otros')
      );
    }
    this.aplicarBusqueda();
  }

  aplicarBusqueda(): void {
    let filtrados = this.categoriaSeleccionada 
      ? this.reportes.filter(r => r.tipo?.toLowerCase() === this.categoriaSeleccionada)
      : [...this.reportes];

    if (this.busqueda.trim()) {
      filtrados = filtrados.filter(r =>
        r.titulo.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        r.descripcion.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    }

    this.reportesFiltrados = filtrados;
  }

  asignarCategoria(reporte: Reporte, categoriaId: string): void {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    if (!categoria) return;

    const confirmar = confirm(`¿Asignar el reporte "${reporte.titulo}" a la categoría "${categoria.nombre}"?`);
    if (!confirmar) return;

    reporte.tipo = categoriaId;
    this.calcularTotales();
    this.aplicarBusqueda();
    
    alert('Categoría asignada correctamente');
  }

  getNombreCategoriaSeleccionada(): string {
    const categoria = this.categorias.find(c => c.id === this.categoriaSeleccionada);
    return categoria ? categoria.nombre : 'Categoría';
  }

  getCategoriaNombre(tipo: string): string {
    const categoria = this.categorias.find(c => c.id === tipo?.toLowerCase());
    return categoria ? categoria.nombre : 'Sin categoría';
  }

  getCategoriaColor(tipo: string): string {
    const categoria = this.categorias.find(c => c.id === tipo?.toLowerCase());
    return categoria ? categoria.color : '#6b7280';
  }

  get totalReportes(): number {
    return this.reportes.length;
  }

  get reportesSinCategorizar(): number {
    return this.reportes.filter(r => !r.tipo || r.tipo === '').length;
  }

  get porcentajeCategorizado(): number {
    if (this.totalReportes === 0) return 0;
    return Math.round(((this.totalReportes - this.reportesSinCategorizar) / this.totalReportes) * 100);
  }
}
