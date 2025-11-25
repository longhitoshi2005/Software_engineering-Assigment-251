"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ClientRoleGuard from "@/components/ClientRoleGuard";
import { Role } from "@/lib/role";

type SuggestionStatus = "NEW" | "REVIEWED" | "REJECTED";

export interface MatchingSuggestion {
  suggestionId: string;
  status: SuggestionStatus;
  student: { id: string; name: string };
  request: { course: string; note?: string; preferredTime?: string };
  suggestedTutor: { id: string; name: string };
  matchScore: number;
  justification: string[];
}

const mock_DATA: MatchingSuggestion[] = [
  {
    suggestionId: "SUG-201",
    status: "NEW",
    student: { id: "23530xx", name: "Nguyen Van T." },
    request: { 
      course: "CO1001 - Programming Fundamentals", 
      note: "Need help debugging pointers and recursion for Lab 3.", 
      preferredTime: "Mon or Wed (afternoon)" 
    },
    suggestedTutor: { id: "tut-1", name: "Pham Q. T." },
    matchScore: 0.92,
    justification: [
      "Direct availability overlap (Wed 14:00 - 15:30).",
      "Tutor expertise 100% match (keywords 'pointers' and 'recursion').",
      "Tutor preference: 'Prefers 1:1 debugging sessions'.",
      "Received 2 positive (5-star) reviews for 'pointers' in the last 30 days."
    ],
  },
  {
    suggestionId: "SUG-202",
    status: "NEW",
    student: { id: "23527xx", name: "Le Anh K." },
    request: { 
      course: "CO2002 - Data Structures", 
      note: "Midterm review, focus on hash tables.",
      preferredTime: "Weekdays (after 17:00)"
    },
    suggestedTutor: { id: "tut-2", name: "Tran H. N." },
    matchScore: 0.78,
    justification: [
      "Availability overlap (Thu 18:00 - 19:30).",
      "Tutor expertise includes 'Data Structures'.",
      "Tutor workload is currently low (4/10 booked sessions).",
      "Note: No specific reviews found for 'hash tables', but strong general CO2002 feedback."
    ],
  },
  {
    suggestionId: "SUG-203",
    status: "REVIEWED",
    student: { id: "23521xx", name: "Phan N. Lan Chi" },
    request: { 
      course: "MA1001 - Calculus I", 
      note: "Struggling with derivatives." 
    },
    suggestedTutor: { id: "tut-3", name: "Truong Q. Thai" },
    matchScore: 0.88,
    justification: [
      "Tutor expertise in 'Calculus I & II'.",
      "Same faculty (Applied Science).",
      "Coordinator Note: Approved (Coord01) - Student confirmed."
    ],
  },
  {
    suggestionId: "SUG-204",
    status: "REJECTED",
    student: { id: "23524xx", name: "Hoang Van B." },
    request: { 
      course: "EE2002 - Digital Systems", 
      note: "Karnaugh maps." 
    },
    suggestedTutor: { id: "tut-4", name: "Nguyen T. A." },
    matchScore: 0.71,
    justification: [
      "Partial availability match (Tutor: Tue AM, Student: Tue PM).",
      "Tutor expertise in 'Digital Systems'.",
      "Coordinator Note: Rejected (Coord01). Student found an alternative."
    ],
  }
];

export default function MatchingSuggestionsPage() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<MatchingSuggestion[]>(mock_DATA);
  const [filterStatus, setFilterStatus] = useState<"ALL" | SuggestionStatus>("NEW");
  const [search, setSearch] = useState("");

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => {
      if (filterStatus !== "ALL" && s.status !== filterStatus) return false;
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        s.student.name.toLowerCase().includes(term) ||
        s.request.course.toLowerCase().includes(term)
      );
    });
  }, [suggestions, filterStatus, search]);

  // Approve/Reject flows removed to enforce mandatory manual review

  const handleOverrideAndAssignManually = (suggestion: MatchingSuggestion) => {
    try {
      // store full suggestion context in sessionStorage so manual-match can show it
      if (typeof window !== "undefined") {
        sessionStorage.setItem("suggestionContext", JSON.stringify(suggestion));
      }
    } catch (err) {
      // ignore storage errors
    }

    router.push(
      `/coord/manual-match?studentId=${encodeURIComponent(suggestion.student.id)}&suggestedTutorId=${encodeURIComponent(
        suggestion.suggestedTutor.id
      )}`
    );
  };

  return (
    <ClientRoleGuard allowedRoles={[Role.COORDINATOR, Role.PROGRAM_ADMIN]} title="Matching Suggestions">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Matching Suggestions</h1>

        <div className="flex items-center gap-4 mb-6">
          <label className="flex items-center gap-2">
            <span className="text-sm">Status</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="ml-2 px-2 py-1 border rounded"
            >
              <option value="ALL">All</option>
              <option value="NEW">New</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </label>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or course"
            className="px-3 py-1 border rounded flex-1"
          />
        </div>

        <div className="space-y-4">
          {filteredSuggestions.length === 0 && (
            <div className="text-sm text-gray-600">No suggestions match your filters.</div>
          )}

          {filteredSuggestions.map((s) => (
            <div key={s.suggestionId} className="p-4 bg-white border rounded shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-medium">{s.student.name} — {s.request.course}</div>
                  {s.request.note && <div className="text-sm text-gray-600">{s.request.note}</div>}
                  <div className="text-sm mt-2">Request ID: <span className="font-mono">{s.suggestionId}</span></div>
                </div>

                <div className="text-right">
                  <div className="text-sm">Tutor: <span className="font-medium">{s.suggestedTutor.name}</span></div>
                  <div className="text-sm">Score: {Math.round(s.matchScore * 100)}%</div>
                  <div className="text-sm mt-1">Status: <span className="capitalize">{s.status.toLowerCase()}</span></div>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-sm font-semibold">Justification</div>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {s.justification.map((j, i) => (
                    <li key={i}>{j}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleOverrideAndAssignManually(s)}
                  className="px-3 py-1 border rounded"
                >
                  Assign Manually
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ClientRoleGuard>
  );
}
