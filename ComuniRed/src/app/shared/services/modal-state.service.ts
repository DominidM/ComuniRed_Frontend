import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface CreateStoryUser {
  id?: string;
  name: string;
  avatarUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class ModalStateService {
  private modalOpenSubject = new BehaviorSubject<boolean>(false);
  private createStoryUserSubject = new BehaviorSubject<CreateStoryUser | null>(null);
  private storyCreatedSubject = new Subject<any>();

  modalOpen$ = this.modalOpenSubject.asObservable();
  createStoryUser$ = this.createStoryUserSubject.asObservable();
  storyCreated$ = this.storyCreatedSubject.asObservable();

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
}
