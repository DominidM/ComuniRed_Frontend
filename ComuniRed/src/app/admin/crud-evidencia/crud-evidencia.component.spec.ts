import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudEvidenciaComponent } from './crud-evidencia.component';

describe('CrudEvidenciaComponent', () => {
  let component: CrudEvidenciaComponent;
  let fixture: ComponentFixture<CrudEvidenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudEvidenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudEvidenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
