import { Component, Input, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css'],
})
export class LoadingOverlayComponent {
  private _loading = false;

  @Input() minDuration = 3000;

  @Input() text = 'Cargando...';

  isVisible = false;

  private shownAt = 0;
  private hideTimeout: any = null;

  constructor(private zone: NgZone) {}

  @Input()
  set loading(value: boolean) {
    if (value === this._loading) return;
    this._loading = !!value;

    if (this._loading) {
      // show immediately
      this.cancelHideTimeout();
      this.shownAt = Date.now();
      this.isVisible = true;
    } else {

      const elapsed = Date.now() - this.shownAt;
      const remaining = Math.max(0, this.minDuration - elapsed);

      this.cancelHideTimeout();
      this.hideTimeout = setTimeout(() => {

        this.zone.run(() => {
          this.isVisible = false;
        });
      }, remaining);
    }
  }

  get loading(): boolean {
    return this._loading;
  }

  private cancelHideTimeout() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }
}
