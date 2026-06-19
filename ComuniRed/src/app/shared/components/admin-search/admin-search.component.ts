import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

@Component({
  selector: 'app-admin-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-search.component.html',
  styleUrls: ['./admin-search.component.css'],
})
export class AdminSearchComponent implements OnDestroy {
  @Input() searchText = '';
  @Input() placeholder = 'Buscar...';
  @Input() filters: SearchFilter[] = [];
  @Input() filterValues: { [key: string]: string } = {};
  @Input() total: number | null = null;
  @Input() totalLabel = 'resultados';
  @Input() loading = false;

  @Output() searchTextChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<{ key: string; value: string }>();

  private debounceTimer?: any;

  ngOnDestroy(): void {
    this.clearDebounce();
  }

  onSearchInput(value: string): void {
    this.searchText = value;
    this.searchTextChange.emit(value);
    this.clearDebounce();
    if (value.length >= 3 || value.length === 0) {
      this.debounceTimer = setTimeout(() => {
        if (value.length >= 3) this.search.emit();
        else this.clear.emit();
      }, 300);
    }
  }

  onSearch(): void {
    this.clearDebounce();
    this.search.emit();
  }

  onClear(): void {
    this.clearDebounce();
    this.searchText = '';
    this.searchTextChange.emit('');
    this.clear.emit();
  }

  onFilterChange(key: string, value: string): void {
    this.filterValues[key] = value;
    this.filterChange.emit({ key, value });
  }

  private clearDebounce(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }
  }
}
