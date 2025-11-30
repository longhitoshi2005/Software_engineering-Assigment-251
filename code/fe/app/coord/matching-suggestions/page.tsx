"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientRoleGuard from "@/components/ClientRoleGuard";
import { Role } from "@/lib/role";
import type { MatchingSuggestion, SuggestionStatus } from "./types";

export default function MatchingSuggestionsPage() {
  const router = useRouter();

  const [suggestions, setSuggestions] = useState<MatchingSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState<"ALL" | SuggestionStatus>("NEW");
  const [search, setSearch] = useState("");

  /* ---------------------------------------------------
    1) LOAD DATA FROM BACKEND
  ---------------------------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/matching-suggestions");
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Failed to load suggestions:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ---------------------------------------------------
    2) FILTERING
  ---------------------------------------------------- */
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

  /* ---------------------------------------------------
    3) MANUAL ASSIGN HANDLER
  ---------------------------------------------------- */
  const handleOverrideAndAssignManually = (s: MatchingSuggestion) => {
    try {
      sessionStorage.setItem("suggestionContext", JSON.stringify(s));
    } catch {}

    router.push(
      `/coord/manual-match?studentId=${encodeURIComponent(s.student.id)}&suggestedTutorId=${encodeURIComponent(
        s.suggestedTutor.id
      )}`
    );
  };

  /* ---------------------------------------------------
    4) RENDER UI
  ---------------------------------------------------- */
  return (
    <ClientRoleGuard allowedRoles={[Role.COORDINATOR, Role.PROGRAM_ADMIN]} title="Matching Suggestions">
      <div className="max-w-6xl mx-auto p-6">

        <h1 className="text-2xl font-semibold mb-4">Matching Suggestions</h1>

        {/* ---------------- FILTERS ---------------- */}
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

        {/* ---------------- LOADING ---------------- */}
        {loading && <p className="text-sm text-gray-600">Loading suggestions...</p>}

        {/* ---------------- EMPTY ---------------- */}
        {!loading && filteredSuggestions.length === 0 && (
          <div className="text-sm text-gray-600">No suggestions match your filters.</div>
        )}

        {/* ---------------- LIST ITEMS ---------------- */}
        <div className="space-y-4">
          {filteredSuggestions.map((s) => (
            <div key={s.suggestionId} className="p-4 bg-white border rounded shadow-sm">
              
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-medium">
                    {s.student.name} — {s.request.course}
                  </div>

                  {s.request.note && (
                    <div className="text-sm text-gray-600">{s.request.note}</div>
                  )}

                  <div className="text-sm mt-2">
                    Suggestion ID: <span className="font-mono">{s.suggestionId}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm">
                    Tutor: <span className="font-medium">{s.suggestedTutor.name}</span>
                  </div>
                  <div className="text-sm">Score: {Math.round(s.matchScore * 100)}%</div>
                  <div className="text-sm mt-1">
                    Status: <span className="capitalize">{s.status.toLowerCase()}</span>
                  </div>
                </div>
              </div>

              {/* Justification */}
              <div className="mt-3">
                <div className="text-sm font-semibold">Justification</div>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {s.justification.map((j, i) => (
                    <li key={i}>{j}</li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleOverrideAndAssignManually(s)}
                  className="px-3 py-1 border rounded hover:bg-soft-white-blue/60 transition"
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
