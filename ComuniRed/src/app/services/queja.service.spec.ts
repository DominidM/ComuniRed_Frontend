import { TestBed } from '@angular/core/testing';

import { QuejaService } from './queja.service';

describe('QuejaService', () => {
  let service: QuejaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuejaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
