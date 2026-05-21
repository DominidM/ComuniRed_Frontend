import { Component, Input, Output, EventEmitter, HostBinding, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'edit'
  | 'delete'
  | 'cancel'
  | 'confirm'
  | 'outline'
  | 'info'
  | 'warning'
  | 'detail'
  | 'view'
  | 'icon'
  | 'close';

export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'button[app-button]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() loading = false;

  @Output() appClick = new EventEmitter<MouseEvent>();

  @HostBinding('class')
  get hostClass(): string {
    const classes = [
      'app-btn',
      `app-btn--${this.variant}`,
      `app-btn--${this.size}`,
    ];
    if (this.disabled || this.loading) classes.push('app-btn--disabled');
    return classes.join(' ');
  }

  @HostBinding('disabled')
  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }

  @Input() disabled = false;

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }
    this.appClick.emit(event);
  }
}
