import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Categoria } from '../../services/categoria.service';

export interface CreateStoryUser {
  id?: string;
  name: string;
  avatarUrl: string;
}

export interface CreateReportData {
  user: { id?: string; name: string; avatarUrl: string } | null;
  categorias: Categoria[];
}

@Injectable({
  providedIn: 'root',
})
export class ModalStateService {
  private modalOpenSubject = new BehaviorSubject<boolean>(false);
  private createStoryUserSubject = new BehaviorSubject<CreateStoryUser | null>(null);
  private storyCreatedSubject = new Subject<any>();
  private createReportSubject = new BehaviorSubject<CreateReportData | null>(null);
  private reportCreatedSubject = new Subject<any>();

  modalOpen$ = this.modalOpenSubject.asObservable();
  createStoryUser$ = this.createStoryUserSubject.asObservable();
  storyCreated$ = this.storyCreatedSubject.asObservable();
  createReport$ = this.createReportSubject.asObservable();
  reportCreated$ = this.reportCreatedSubject.asObservable();

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

  openCreateStory(user: CreateStoryUser): void {
    this.createStoryUserSubject.next(user);
  }

  closeCreateStory(): void {
    this.createStoryUserSubject.next(null);
  }

  emitStoryCreated(story: any): void {
    this.storyCreatedSubject.next(story);
  }

  openCreateReport(data: CreateReportData): void {
    this.createReportSubject.next(data);
    this.modalOpenSubject.next(true);
  }

  closeCreateReport(): void {
    this.createReportSubject.next(null);
    this.modalOpenSubject.next(false);
  }

  emitReportCreated(report: any): void {
    this.reportCreatedSubject.next(report);
  }
}
