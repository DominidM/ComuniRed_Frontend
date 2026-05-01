import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService, ConfirmDialog } from '../../services/change.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit, OnDestroy {
  confirmDialog: ConfirmDialog | null = null;
  private sub!: Subscription;

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.sub = this.alertService.confirm$.subscribe(dialog => {
      this.confirmDialog = dialog;
    });
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
    this.sub.unsubscribe();
  }
}