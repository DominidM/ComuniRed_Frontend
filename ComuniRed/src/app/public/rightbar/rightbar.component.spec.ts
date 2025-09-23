import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightbarComponent } from './rightbar.component';

describe('RightbarComponent', () => {
  let component: RightbarComponent;
  let fixture: ComponentFixture<RightbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RightbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
