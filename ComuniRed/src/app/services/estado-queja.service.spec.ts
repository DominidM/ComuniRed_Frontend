import { TestBed } from '@angular/core/testing';

import { EstadoQuejaService } from './estado-queja.service';

describe('EstadoQuejaService', () => {
  let service: EstadoQuejaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadoQuejaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
