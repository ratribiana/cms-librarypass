import { TestBed } from '@angular/core/testing';

import { UserMaintenanceService } from './user-maintenance.service';

describe('UserMaintenanceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserMaintenanceService = TestBed.get(UserMaintenanceService);
    expect(service).toBeTruthy();
  });
});
