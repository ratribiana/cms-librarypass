import { TestBed } from '@angular/core/testing';

import { PromotionsService } from './promotions.service';

describe('PromotionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PromotionsService = TestBed.get(PromotionsService);
    expect(service).toBeTruthy();
  });
});
