import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Alert {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ConfirmDialog {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-change',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './change.component.html',
  styleUrls: ['./change.component.css']
})
export class ChangeComponent implements OnChanges, OnDestroy {
  @Input() alerts: Alert[] = [];
  @Input() confirmDialog: ConfirmDialog | null = null;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() removeAlert = new EventEmitter<Alert>();

  ngOnChanges(changes: SimpleChanges): void {
    if ('confirmDialog' in changes) {
      if (this.confirmDialog) {
        document.body.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
      }
    }
  }

  ngOnDestroy(): void {
    document.body.classList.remove('modal-open');
  }

  onConfirm(): void {
    document.body.classList.remove('modal-open');
    this.confirm.emit();
  }

  onCancel(): void {
    document.body.classList.remove('modal-open');
    this.cancel.emit();
  }

  onRemoveAlert(alert: Alert): void {
    this.removeAlert.emit(alert);
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.confirmDialog) {
      this.onCancel();
    }
  }
}