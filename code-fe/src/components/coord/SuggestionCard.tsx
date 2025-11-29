"use client";

import React from "react";
import ReviewAssignButton from "@/components/coord/ReviewAssignButton";
import { SuggestionShape } from "@/types/matching";

export default function SuggestionCard({ suggestion }: { suggestion: SuggestionShape }) {
  return (
    <div className="py-3 flex items-start gap-3">
      <div className="flex-1">
        <div className="text-sm text-black/80">
          <span className="font-semibold text-dark-blue">{suggestion.studentId} – {suggestion.student}</span> · {suggestion.course}
        </div>
        <div className="text-xs text-black/60 mt-1">
          Suggest: <span className="font-medium">{suggestion.suggestedTutor}</span> · Score {(suggestion.score * 100).toFixed(0)}%
        </div>
        <div className="text-xs text-black/50 mt-1">{suggestion.reason}</div>
      </div>
      <div className="flex gap-2">
        <ReviewAssignButton suggestion={suggestion} />
      </div>
    </div>
  );
}
