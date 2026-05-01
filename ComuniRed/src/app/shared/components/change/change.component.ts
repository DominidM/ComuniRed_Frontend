import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService, Alert, ConfirmDialog } from '../../services/change.service';

@Component({
  selector: 'app-change',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './change.component.html',
  styleUrls: ['./change.component.css']
})
export class ChangeComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  confirmDialog: ConfirmDialog | null = null;
  private subs: Subscription[] = [];

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.subs.push(
      this.alertService.alerts$.subscribe(alert => {
        this.alerts.push(alert);
        setTimeout(() => this.remove(alert), alert.duration || 4000);
      }),
      this.alertService.confirm$.subscribe(dialog => {
        this.confirmDialog = dialog;
      })
    );
  }

  remove(alert: Alert) {
    this.alerts = this.alerts.filter(a => a !== alert);
  }

  onConfirm() {
    this.confirmDialog?.resolve(true);
    this.confirmDialog = null;
  }

  onCancel() {
    this.confirmDialog?.resolve(false);
    this.confirmDialog = null;
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}