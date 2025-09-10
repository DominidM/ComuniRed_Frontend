import { TestBed } from '@angular/core/testing';

import { ReaccionService } from './reaccion.service';

describe('ReaccionService', () => {
  let service: ReaccionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReaccionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
