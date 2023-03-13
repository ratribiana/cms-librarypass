import { TestBed } from '@angular/core/testing';

import { AnnounceService } from './announce.service';

describe('AnnounceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AnnounceService = TestBed.get(AnnounceService);
    expect(service).toBeTruthy();
  });
});
