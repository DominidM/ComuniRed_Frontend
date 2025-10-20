import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Queja {
  id: string;
  titulo: string;
  ubicacion: string;
  categoria: string;
  estado: string;
  posX: number; // Posición X en porcentaje (0-100) - En producción usar lat/lng
  posY: number; // Posición Y en porcentaje (0-100) - En producción usar lat/lng
}

interface Categoria {
  nombre: string;
  color: string;
}

interface Estado {
  nombre: string;
  color: string;
}

/*
 * NOTA PARA INTEGRACIÓN CON MAPA REAL DE LIMA:
 * 
 * Para usar un mapa real de Lima, Perú, puedes integrar:
 * 
 * 1. Leaflet (Recomendado - Open Source):
 *    npm install leaflet @types/leaflet
 *    Centro: [-12.0464, -77.0428] (Lima, Perú)
 *    Zoom inicial: 12
 * 
 * 2. Google Maps:
 *    Centro: { lat: -12.0464, lng: -77.0428 }
 *    Restricción de límites para Lima Metropolitana
 * 
 * 3. Mapbox:
 *    Centro: [-77.0428, -12.0464]
 *    Estilo personalizado para Perú
 * 
 * Coordenadas de ejemplo para Lima:
 * - Miraflores: -12.1191, -77.0349
 * - San Isidro: -12.0956, -77.0364
 * - Cercado: -12.0464, -77.0428
 */

@Component({
  selector: 'app-mapa-general',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa-general.component.html',
  styleUrl: './mapa-general.component.css'
})
export class MapaGeneralComponent implements OnInit {
  // Datos de categorías
  categorias: Categoria[] = [
    { nombre: 'Baches', color: '#ef4444' },
    { nombre: 'Alumbrado Público', color: '#f59e0b' },
    { nombre: 'Alcantarillado', color: '#3b82f6' },
    { nombre: 'Basura', color: '#10b981' },
    { nombre: 'Señalización', color: '#8b5cf6' }
  ];

  // Datos de estados
  estados: Estado[] = [
    { nombre: 'Pendiente', color: '#f59e0b' },
    { nombre: 'En Proceso', color: '#3b82f6' },
    { nombre: 'Resuelta', color: '#10b981' },
    { nombre: 'Rechazada', color: '#ef4444' }
  ];

  // Datos de quejas de ejemplo - Ajustadas para Lima, Perú
  // Coordenadas simuladas dentro de los límites de Lima Metropolitana
  quejas: Queja[] = [
    {
      id: '1',
      titulo: 'Bache gigante en Av. Principal',
      ubicacion: 'Av. Principal #123, Col. Centro',
      categoria: 'Baches',
      estado: 'En Proceso',
      posX: 45,
      posY: 40
    },
    {
      id: '2',
      titulo: 'Falta de iluminación en parque',
      ubicacion: 'Parque Central, Col. Roma',
      categoria: 'Alumbrado Público',
      estado: 'Pendiente',
      posX: 60,
      posY: 35
    },
    {
      id: '3',
      titulo: 'Fuga de agua en la calle',
      ubicacion: 'Calle Insurgentes #456',
      categoria: 'Alcantarillado',
      estado: 'Resuelta',
      posX: 50,
      posY: 55
    },
    {
      id: '4',
      titulo: 'Señal de alto vandalizada',
      ubicacion: 'Esquina Reforma y Juárez',
      categoria: 'Señalización',
      estado: 'Pendiente',
      posX: 40,
      posY: 65
    },
    {
      id: '5',
      titulo: 'Acumulación de basura',
      ubicacion: 'Col. Condesa, Calle Ámsterdam',
      categoria: 'Basura',
      estado: 'En Proceso',
      posX: 70,
      posY: 50
    },
    // Quejas adicionales para Lima
    {
      id: '6',
      titulo: 'Poste de luz caído',
      ubicacion: 'Av. Arequipa, Miraflores',
      categoria: 'Alumbrado Público',
      estado: 'Pendiente',
      posX: 55,
      posY: 45
    },
    {
      id: '7',
      titulo: 'Basura acumulada',
      ubicacion: 'Jr. Lampa, Cercado de Lima',
      categoria: 'Basura',
      estado: 'Resuelta',
      posX: 35,
      posY: 30
    }
  ];

  // Filtros
  selectedCategoria: string = 'todas';
  selectedEstado: string = 'todos';
  quejasFiltradas: Queja[] = [];
  quejasTotal: number = 0;

  // Tooltip
  tooltipQueja: Queja | null = null;

  ngOnInit(): void {
    this.quejasTotal = this.quejas.length;
    this.quejasFiltradas = [...this.quejas];
  }

  // Filtrar por categoría
  filterByCategoria(categoria: string): void {
    this.selectedCategoria = categoria;
    this.applyFilters();
  }

  // Filtrar por estado
  filterByEstado(estado: string): void {
    this.selectedEstado = estado;
    this.applyFilters();
  }

  // Aplicar filtros combinados
  applyFilters(): void {
    this.quejasFiltradas = this.quejas.filter(queja => {
      const matchCategoria = this.selectedCategoria === 'todas' || queja.categoria === this.selectedCategoria;
      const matchEstado = this.selectedEstado === 'todos' || queja.estado === this.selectedEstado;
      return matchCategoria && matchEstado;
    });
  }

  // Obtener color de categoría
  getCategoriaColor(categoria: string): string {
    const cat = this.categorias.find(c => c.nombre === categoria);
    return cat ? cat.color : '#6b7280';
  }

  // Obtener color de estado
  getEstadoColor(estado: string): string {
    const est = this.estados.find(e => e.nombre === estado);
    return est ? est.color : '#6b7280';
  }

  // Mostrar tooltip
  showTooltip(queja: Queja): void {
    this.tooltipQueja = queja;
  }

  // Ocultar tooltip
  hideTooltip(): void {
    this.tooltipQueja = null;
  }
}