import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

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
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private alertSubject = new Subject<Alert>();
  private confirmSubject = new Subject<ConfirmDialog>();

  alerts$ = this.alertSubject.asObservable();
  confirm$ = this.confirmSubject.asObservable();

  success(message: string, duration = 4000) {
    this.alertSubject.next({ type: 'success', message, duration });
  }

  error(message: string, duration = 4000) {
    this.alertSubject.next({ type: 'error', message, duration });
  }

  warning(message: string, duration = 4000) {
    this.alertSubject.next({ type: 'warning', message, duration });
  }

  info(message: string, duration = 4000) {
    this.alertSubject.next({ type: 'info', message, duration });
  }

  confirm(
    title: string,
    message: string,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmSubject.next({ title, message, confirmText, cancelText, resolve });
    });
  }
}