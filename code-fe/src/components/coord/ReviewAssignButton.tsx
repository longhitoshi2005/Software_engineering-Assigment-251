"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { SuggestionShape } from "@/types/matching";

export default function ReviewAssignButton({ suggestion }: { suggestion: SuggestionShape }) {
  const router = useRouter();

  const handleReviewSuggestion = (suggestion: SuggestionShape) => {
    const studentId = suggestion.studentId;
    const suggestedTutorId = suggestion.suggestedTutorId;
    try {
      if (typeof window !== "undefined") {
        // store suggestion context for manual-match to display
        sessionStorage.setItem("suggestionContext", JSON.stringify(suggestion));
      }
    } catch (err) {
      // ignore
    }

    router.push(
      `/coord/manual-match?studentId=${encodeURIComponent(studentId)}&suggestedTutorId=${encodeURIComponent(
        suggestedTutorId
      )}`
    );
  };

  return (
    <button
      onClick={() => handleReviewSuggestion(suggestion)}
      className="text-sm font-semibold rounded-lg px-3 py-2 bg-[#24449A] text-white"
    >
      Review & Assign
    </button>
  );
}
