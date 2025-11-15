import { Injectable } from '@nestjs/common';
import { CONFLICTS } from '../mocks/data.mock';

@Injectable()
export class ConflictsService {
  async listConflicts(department?: string) {
    // department ignored in mock, return all
    return Promise.resolve(CONFLICTS);
  }
}
