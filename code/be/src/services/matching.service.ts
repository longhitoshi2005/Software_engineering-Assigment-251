import { Injectable } from '@nestjs/common';
import { SUGGESTIONS } from '../mocks/data.mock';

@Injectable()
export class MatchingService {
  async getSuggestions(studentId?: string, limit = 5) {
    // return mock suggestions filtered by studentId if provided
    const list = SUGGESTIONS.slice(0, limit);
    return Promise.resolve({ suggestions: list });
  }
}
