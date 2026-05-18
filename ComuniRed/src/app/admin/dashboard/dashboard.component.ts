import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, forkJoin, of, timer } from 'rxjs';
import { take, catchError, timeout } from 'rxjs/operators';
import { UsuarioService } from '../../services/usuario.service';
import { QuejaService, Queja } from '../../services/queja.service';
import { AsignacionService, Asignacion } from '../../services/asignacion.service';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';

interface StatusBar { label: string; count: number; color: string; }
interface CategoryBar { label: string; count: number; color: string; }
interface PieSegment {
  label: string;
  value: number;
  color: string;
  percent: number;
  dash: number;
  offset: number;
}

const STATUS_COLORS = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];
const CATEGORY_COLORS = ['#ef4444','#f59e0b','#3b82f6','#10b981','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16'];
const PIE_COLORS = ['#1e40af','#3b82f6','#60a5fa','#93c5fd','#bfdbfe','#7c3aed','#a78bfa','#c4b5fd','#f472b6','#34d399'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, WorkspaceHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  metrics = { totalComplaints: 0, activeUsers: 0, assignments: 0, resolutionRate: 0 };

  statusBars: StatusBar[] = [];
  get statusTotal() { return this.statusBars.reduce((s, v) => s + v.count, 0); }

  topCategories: CategoryBar[] = [];
  get maxCategoryCount() { return Math.max(...this.topCategories.map(c => c.count), 1); }

  pieSegments: PieSegment[] = [];
  pieTotal = 0;

  pieRadius = 40;
  pieStroke = 24;
  pieCircumference = 2 * Math.PI * this.pieRadius;
  pieViewBox = 160;
  pieCenter = 80;

  months: string[] = [];
  resolved: number[] = [];
  pending: number[] = [];

  areaResolvedPath = '';
  areaPendingPath = '';
  areaResolvedLine = '';
  areaPendingLine = '';

  private userCountSub?: Subscription;
  private dataSub?: Subscription;

  constructor(
    private usuarioService: UsuarioService,
    private quejaService: QuejaService,
    private asignacionService: AsignacionService,
  ) {}

  ngOnInit(): void {
    this.userCountSub = this.usuarioService.userCount$.subscribe(n => {
      if (typeof n === 'number') this.metrics.activeUsers = n;
    });
    this.fetchDashboardData();
  }

  ngOnDestroy(): void {
    this.userCountSub?.unsubscribe();
    this.dataSub?.unsubscribe();
  }

  private fetchDashboardData(): void {
    const q$ = this.quejaService.obtenerQuejas('').pipe(
      take(1),
      timeout(15000),
      catchError(err => {
        console.warn('Dashboard: error en obtenerQuejas', err);
        return of([] as Queja[]);
      })
    );
    const a$ = this.asignacionService.obtenerAsignacionesActivas().pipe(
      take(1),
      timeout(15000),
      catchError(err => {
        console.warn('Dashboard: error en asignacionesActivas', err);
        return of([] as Asignacion[]);
      })
    );
    this.dataSub = forkJoin({ quejas: q$, asignaciones: a$ }).subscribe({
      next: ({ quejas, asignaciones }) => this.processData(quejas, asignaciones),
      error: err => console.error('Dashboard: forkJoin falló', err)
    });
  }

  private processData(quejas: Queja[], asignaciones: Asignacion[]): void {
    this.metrics.totalComplaints = quejas.length;
    this.metrics.assignments = asignaciones.length;

    const resolvedCount = quejas.filter(q => this.isResolved(q)).length;
    this.metrics.resolutionRate = quejas.length > 0 ? Math.round((resolvedCount / quejas.length) * 100) : 0;

    this.statusBars = this.buildStatusBars(quejas);
    this.topCategories = this.buildTopCategories(quejas);
    this.pieSegments = this.buildPieSegments(quejas);
    this.processAreaChart(quejas);
  }

  private isResolved(q: Queja): boolean {
    if (!q.estado) return false;
    const name = (q.estado.nombre || '').toLowerCase();
    const clave = (q.estado.clave || '').toLowerCase();
    return name.includes('resuelta') || name.includes('completada') || name.includes('solucionado') || name.includes('cerrada')
      || clave === 'resuelta' || clave === 'completada' || clave === 'solucionado' || clave === 'cerrada';
  }

  private buildStatusBars(quejas: Queja[]): StatusBar[] {
    const map = new Map<string, number>();
    for (const q of quejas) {
      const label = q.estado?.nombre || 'Sin estado';
      map.set(label, (map.get(label) || 0) + 1);
    }
    const entries = Array.from(map.entries());
    entries.sort((a, b) => b[1] - a[1]);
    return entries.map(([label, count], i) => ({
      label,
      count,
      color: STATUS_COLORS[i % STATUS_COLORS.length],
    }));
  }

  private buildTopCategories(quejas: Queja[]): CategoryBar[] {
    const map = new Map<string, number>();
    for (const q of quejas) {
      const label = q.categoria?.nombre || 'Sin categoría';
      map.set(label, (map.get(label) || 0) + 1);
    }
    const entries = Array.from(map.entries());
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 5).map(([label, count], i) => ({
      label,
      count,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));
  }

  private buildPieSegments(quejas: Queja[]): PieSegment[] {
    const map = new Map<string, number>();
    for (const q of quejas) {
      const label = q.ubicacion || 'Sin ubicación';
      map.set(label, (map.get(label) || 0) + 1);
    }
    const entries = Array.from(map.entries());
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, 6);
    const total = top.reduce((s, [, v]) => s + v, 0);

    if (total === 0) return [];

    this.pieTotal = total;
    this.pieCircumference = 2 * Math.PI * this.pieRadius;

    const segments: PieSegment[] = [];
    let offsetAcc = 0;
    for (let i = 0; i < top.length; i++) {
      const [label, value] = top[i];
      const percent = Math.round((value / total) * 100);
      const dash = (value / total) * this.pieCircumference;
      segments.push({
        label,
        value,
        color: PIE_COLORS[i % PIE_COLORS.length],
        percent,
        dash,
        offset: -offsetAcc,
      });
      offsetAcc += dash;
    }
    return segments;
  }

  private processAreaChart(quejas: Queja[]): void {
    const monthMap = new Map<string, { resolved: number; pending: number }>();
    const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

    for (const q of quejas) {
      if (!q.fecha_creacion) continue;
      const d = new Date(q.fecha_creacion);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap.has(key)) monthMap.set(key, { resolved: 0, pending: 0 });
      const entry = monthMap.get(key)!;
      if (this.isResolved(q)) entry.resolved++;
      else entry.pending++;
    }

    const sorted = Array.from(monthMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    this.months = sorted.map(([k]) => {
      const [, m] = k.split('-');
      return monthNames[parseInt(m, 10) - 1] || k;
    });
    this.resolved = sorted.map(([, v]) => v.resolved);
    this.pending = sorted.map(([, v]) => v.pending);

    if (this.resolved.length === 0 && this.pending.length === 0) return;
    this.prepareAreaPaths();
  }

  prepareAreaPaths(): void {
    const width = 400;
    const height = 140;
    const maxVal = Math.max(...this.resolved, ...this.pending) || 1;
    const points = (arr: number[]) => arr.map((v, i) => {
      const x = 20 + (i * ((width - 40) / (Math.max(arr.length, 1) - 1 || 1)));
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

  private buildAreaPath(pts: {x:number;y:number}[], width:number, height:number): string {
    if (!pts.length) return '';
    const start = `M ${pts[0].x} ${height}`;
    const line = pts.map(p => `L ${p.x} ${p.y}`).join(' ');
    const end = `L ${pts[pts.length-1].x} ${height} Z`;
    return `${start} ${line} ${end}`;
  }

  private buildLinePath(pts: {x:number;y:number}[]): string {
    if (!pts.length) return '';
    return pts.map((p,i) => (i===0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  }

  public refreshUsersCount(): void {
    try { (this.usuarioService as any).refreshUserCount?.(); } catch {}
  }
}