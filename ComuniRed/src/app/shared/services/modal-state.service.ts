import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalStateService {
  private modalOpenSubject = new BehaviorSubject<boolean>(false);

  modalOpen$ = this.modalOpenSubject.asObservable();

  open(): void {
    this.modalOpenSubject.next(true);
  }

  close(): void {
    this.modalOpenSubject.next(false);
  }

  setState(isOpen: boolean): void {
    this.modalOpenSubject.next(isOpen);
  }

  get currentState(): boolean {
    return this.modalOpenSubject.value;
  }
}