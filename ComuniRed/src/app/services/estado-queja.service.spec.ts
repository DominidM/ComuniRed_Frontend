import { TestBed } from '@angular/core/testing';

import { EstadosQuejaService } from './estado-queja.service';

describe('EstadosQuejaService', () => {
  let service: EstadosQuejaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadosQuejaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
