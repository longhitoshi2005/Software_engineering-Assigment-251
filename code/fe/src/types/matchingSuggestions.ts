export enum SuggestionStatus {
  NEW = "NEW",
  REVIEWED = "REVIEWED",
  REJECTED = "REJECTED",
}

export interface MatchingSuggestion {
  suggestionId: string;
  status: SuggestionStatus;

  student: {
    id: string;
    name: string;
  };

  request: {
    course: string;
    note?: string;
    preferredTime?: string;
  };

  suggestedTutor: {
    id: string;
    name: string;
  };

  matchScore: number;
  justification: string[];
}
