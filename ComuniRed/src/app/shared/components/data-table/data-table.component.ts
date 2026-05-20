import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DataTableColumn {
  key: string;
  label: string;
  width?: string;
  headerClass?: string;
  cellClass?: string;
}

export type DataTableViewMode = 'table' | 'card';

@Directive({
  selector: 'ng-template[dataTableCell]',
  standalone: true,
})
export class DataTableCellDirective {
  @Input('dataTableCell') key!: string;
  constructor(public template: TemplateRef<any>) {}
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'],
})
export class DataTableComponent implements AfterContentInit {
  @Input() columns: DataTableColumn[] = [];
  @Input() rows: any[] = [];
  @Input() page = 0;
  @Input() pages: number[] = [];
  @Input() totalPages = 0;
  @Input() totalElements = 0;
  @Input() loading = false;
  @Input() emptyMessage = 'Sin datos';
  @Input() minWidth = '100%';
  @Input() tableClass = '';
  @Input() showPagination = true;
  @Input() rowTrackBy?: (index: number, row: any) => any;
  @Input() viewMode: DataTableViewMode = 'table';

  @Output() pageChange = new EventEmitter<number>();

  @ContentChildren(DataTableCellDirective, { descendants: true })
  cellTemplates!: QueryList<DataTableCellDirective>;

  public templateMap = new Map<string, TemplateRef<any>>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterContentInit(): void {
    queueMicrotask(() => this.syncTemplates());
    this.cellTemplates.changes.subscribe(() =>
      queueMicrotask(() => this.syncTemplates())
    );
  }

  private syncTemplates(): void {
    this.templateMap.clear();
    this.cellTemplates?.forEach((item) => {
      if (item.key) this.templateMap.set(item.key, item.template);
    });
    this.cdr.detectChanges();
  }

  setViewMode(mode: DataTableViewMode): void {
    this.viewMode = mode;
  }

  hasTemplate(key: string): boolean {
    return this.templateMap.has(key);
  }

  getCellValue(row: any, key: string): any {
    return row?.[key];
  }

  getHeaderClass(column: DataTableColumn): string {
    return column.headerClass || '';
  }

  getCellClass(column: DataTableColumn): string {
    return column.cellClass || '';
  }

  trackByRow = (index: number, row: any) =>
    this.rowTrackBy ? this.rowTrackBy(index, row) : (row?.id ?? index);

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.page) return;
    this.pageChange.emit(page);
  }
}