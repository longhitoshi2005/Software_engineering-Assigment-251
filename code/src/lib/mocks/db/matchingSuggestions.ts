import { MatchingSuggestion, SuggestionStatus } from "@/types/matchingSuggestions";

export const MATCHING_SUGGESTIONS: MatchingSuggestion[] = [
  {
    suggestionId: "SUG-201",
    status: SuggestionStatus.NEW,
    student: { 
      id: "23530xx", 
      name: "Nguyen Van T." 
    },
    request: {
      course: "CO1001 - Programming Fundamentals",
      note: "Need help debugging pointers and recursion.",
      preferredTime: "Mon or Wed afternoon",
    },
    suggestedTutor: { 
      id: "tut-1", 
      name: "Pham Q. T." 
    },
    matchScore: 0.92,
    justification: [
      "Overlapping availability",
      "Strong expertise match for 'pointers' and 'recursion'"
    ],
  },

  {
    suggestionId: "SUG-202",
    status: SuggestionStatus.NEW,
    student: { 
      id: "23527xx", 
      name: "Le Anh K." 
    },
    request: {
      course: "CO2002 - Data Structures",
      note: "Need help with hash tables",
    },
    suggestedTutor: { 
      id: "tut-2", 
      name: "Tran H. N." 
    },
    matchScore: 0.78,
    justification: [
      "Availability match",
      "Tutor has strong Data Structures expertise"
    ],
  },

  {
    suggestionId: "SUG-203",
    status: SuggestionStatus.REVIEWED,
    student: { 
      id: "23521xx", 
      name: "Phan N. Lan Chi" 
    },
    request: {
      course: "MA1001 - Calculus I",
      note: "Struggling with derivatives",
    },
    suggestedTutor: { 
      id: "tut-3", 
      name: "Truong Q. Thai" 
    },
    matchScore: 0.88,
    justification: [
      "Tutor expertise in Calculus I/II",
      "Reviewed previously — matched by coordinator"
    ],
  },
];
