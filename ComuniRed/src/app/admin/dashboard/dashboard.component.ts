import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { UsuarioService } from '../../services/usuario.service';



interface PieSegment {
  label: string;
  value: number;
  color: string;
  percent: number;
  dash: number;
  offset: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  metrics = {
    totalComplaints: 5,
    activeUsers: 0,
    assignments: 3,
    resolutionRate: 20
  };

  statusBars = [
    { label: 'Pendientes', count: 2, color: '#f97316' },
    { label: 'En Proceso', count: 2, color: '#3b82f6' },
    { label: 'Resueltas', count: 1, color: '#10b981' }
  ];
  get statusTotal() { return this.statusBars.reduce((s, v) => s + v.count, 0); }

  topCategories = [
    { label: 'Baches', count: 1, color: '#ef4444' },
    { label: 'Alumbrado Público', count: 1, color: '#f59e0b' },
    { label: 'Alcantarillado', count: 1, color: '#3b82f6' },
    { label: 'Basura', count: 1, color: '#10b981' },
    { label: 'Señalización', count: 1, color: '#8b5cf6' }
  ];
  get maxCategoryCount() { return Math.max(...this.topCategories.map(c => c.count), 1); }

  pieSegments: PieSegment[] = [
    { label: 'Centro', value: 128, color: '#1e40af', percent: 0, dash: 0, offset: 0 },
    { label: 'Norte', value: 96, color: '#3b82f6', percent: 0, dash: 0, offset: 0 },
    { label: 'Sur', value: 64, color: '#60a5fa', percent: 0, dash: 0, offset: 0 },
    { label: 'Oriente', value: 32, color: '#93c5fd', percent: 0, dash: 0, offset: 0 },
  ];
  pieTotal = 0;

  pieRadius = 40;
  pieStroke = 24;
  pieCircumference = 2 * Math.PI * this.pieRadius;
  pieViewBox = 160;
  pieCenter = 80;

  months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct'];
  resolved = [20,25,28,30,32,35,40,42,45,48];
  pending =  [15,12,18,16,14,12,10,11,9,7];

  areaResolvedPath = '';
  areaPendingPath = '';
  areaResolvedLine = '';
  areaPendingLine = '';

  private userCountSub?: Subscription;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    // Subscribe to centralized user count (updates automatically from UsuarioService)
    this.userCountSub = this.usuarioService.userCount$.subscribe(n => {
      if (typeof n === 'number') {
        this.metrics.activeUsers = n;
      }
    });

    // Prepare static/initial graphics
    this.preparePie();
    this.prepareAreaPaths();
  }

  ngOnDestroy(): void {
    this.userCountSub?.unsubscribe();
  }

  preparePie() {
    // Recalculate circumference in case radius was changed
    this.pieCircumference = 2 * Math.PI * this.pieRadius;
    this.pieTotal = this.pieSegments.reduce((s, x) => s + x.value, 0) || 1;
    let offsetAcc = 0;
    for (let i = 0; i < this.pieSegments.length; i++) {
      const seg = this.pieSegments[i];
      seg.percent = Math.round((seg.value / this.pieTotal) * 100);
      seg.dash = (seg.value / this.pieTotal) * this.pieCircumference;
      seg.offset = -offsetAcc;
      offsetAcc += seg.dash;
    }
  }

  prepareAreaPaths() {
    const width = 400;
    const height = 140;
    const maxVal = Math.max(...this.resolved, ...this.pending) || 1;
    const points = (arr: number[]) => arr.map((v, i) => {
      const x = 20 + (i * ((width - 40) / (arr.length - 1)));
      const y = height - ((v / maxVal) * (height - 20));
      return { x, y };
    });

    const resPts = points(this.resolved);
    const penPts = points(this.pending);

    this.areaResolvedPath = this.buildAreaPath(resPts, width, height);
    this.areaPendingPath = this.buildAreaPath(penPts, width, height);

    this.areaResolvedLine = this.buildLinePath(resPts);
    this.areaPendingLine = this.buildLinePath(penPts);
  }

  private buildAreaPath(pts: {x:number,y:number}[], width:number, height:number) {
    if (!pts.length) return '';
    const start = `M ${pts[0].x} ${height}`;
    const line = pts.map(p => `L ${p.x} ${p.y}`).join(' ');
    const end = `L ${pts[pts.length-1].x} ${height} Z`;
    return `${start} ${line} ${end}`;
  }

  private buildLinePath(pts: {x:number,y:number}[]) {
    if (!pts.length) return '';
    return pts.map((p,i) => (i===0? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  }

  // Optional: helper to force a refresh from the service (e.g. called by other components)
  public refreshUsersCount(): void {
    try { (this.usuarioService as any).refreshUserCount?.(); } catch {}
  }
}