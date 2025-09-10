import { TestBed } from '@angular/core/testing';

import { TipoReaccionService } from './tipo-reaccion.service';

describe('TipoReaccionService', () => {
  let service: TipoReaccionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoReaccionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
