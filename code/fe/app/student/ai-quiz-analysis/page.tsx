"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { QuizSource, QuizStatus, QuizDifficulty, QuizItem } from "@/types";

type AttemptRecord = {
  quizId: string;
  userAnswer: string;
  confidenceLevel: number;
  fluctuateBetween?: string[];
  reasoning?: string;
  isCorrect: boolean;
  timeSpentSec: number;
  createdAt: string;
};

export default function AIQuizAnalysisPage() {
  const [myQuizzes, setMyQuizzes] = useState<QuizItem[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const quizzes = JSON.parse(localStorage.getItem("myQuizzes") || "[]");
      const savedAttempts = JSON.parse(localStorage.getItem("quizAttempts") || "[]");
      setMyQuizzes(quizzes);
      setAttempts(savedAttempts);
    }
  }, []);

  const totalGenerated = myQuizzes.length;
  const totalSolved = myQuizzes.filter((q) => q.status === "solved").length;
  const totalSkipped = myQuizzes.filter((q) => q.status === "skipped").length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;

  // Confidence analysis by range
  const noIdeaAttempts = attempts.filter((a) => a.confidenceLevel === 0);
  const guessAttempts = attempts.filter((a) => a.confidenceLevel === 1);
  const unsureAttempts = attempts.filter((a) => a.confidenceLevel === 2);
  const leaningAttempts = attempts.filter((a) => a.confidenceLevel === 3);
  const confidentAttempts = attempts.filter((a) => a.confidenceLevel === 4);
  const absolutelyConfidentAttempts = attempts.filter((a) => a.confidenceLevel === 5);

  // Group by low/mid/high confidence
  const lowConfidence = attempts.filter((a) => a.confidenceLevel <= 1);
  const midConfidence = attempts.filter(
    (a) => a.confidenceLevel >= 2 && a.confidenceLevel <= 3
  );
  const highConfidence = attempts.filter((a) => a.confidenceLevel >= 4);

  // Topic stats with correct/incorrect tracking
  const topicStats: Record<
    string,
    { generated: number; solved: number; skipped: number; correct: number }
  > = {};
  myQuizzes.forEach((q) => {
    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { generated: 0, solved: 0, skipped: 0, correct: 0 };
    }
    topicStats[q.topic].generated++;
    if (q.status === "solved") topicStats[q.topic].solved++;
    if (q.status === "skipped") topicStats[q.topic].skipped++;

    // Count correct answers for this topic
    const attempt = attempts.find((a) => a.quizId === q.id);
    if (attempt && attempt.isCorrect) {
      topicStats[q.topic].correct++;
    }
  });

  const weakTopics = Object.entries(topicStats)
    .map(([topic, stats]) => ({
      topic,
      ...stats,
      accuracy: stats.solved > 0 ? Math.round((stats.correct / stats.solved) * 100) : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  // Source stats with correct/incorrect tracking
  const sourceStats: Record<
    string,
    { generated: number; solved: number; correct: number }
  > = {
    "trusted-bank": { generated: 0, solved: 0, correct: 0 },
    "ai-freeform": { generated: 0, solved: 0, correct: 0 },
  };
  myQuizzes.forEach((q) => {
    sourceStats[q.source].generated++;
    if (q.status === "solved") sourceStats[q.source].solved++;

    // Count correct answers for this source
    const attempt = attempts.find((a) => a.quizId === q.id);
    if (attempt && attempt.isCorrect) {
      sourceStats[q.source].correct++;
    }
  });

  const sourceEffectiveness = Object.entries(sourceStats).map(([source, stats]) => ({
    source,
    ...stats,
    accuracy: stats.solved > 0 ? Math.round((stats.correct / stats.solved) * 100) : 0,
  }));

  // Difficulty stats
  const difficultyStats: Record<string, { generated: number; solved: number }> = {};
  myQuizzes.forEach((q) => {
    if (!difficultyStats[q.difficulty]) {
      difficultyStats[q.difficulty] = { generated: 0, solved: 0 };
    }
    difficultyStats[q.difficulty].generated++;
    if (q.status === "solved") difficultyStats[q.difficulty].solved++;
  });

  const difficultyBreakdown = Object.entries(difficultyStats).map(
    ([difficulty, stats]) => ({
      difficulty,
      ...stats,
    })
  );

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue py-6">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mb-6">
        <h1 className="text-2xl font-semibold text-dark-blue mb-2">Quiz Analysis</h1>
        <p className="text-sm text-black/70 max-w-2xl">
          See which topics and difficulty levels you are struggling with based on your
          quiz history.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm">
            <p className="text-xs font-medium text-black/60 uppercase tracking-wide">
              Total Generated
            </p>
            <p className="text-3xl font-bold text-dark-blue mt-2">{totalGenerated}</p>
          </div>
          <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm">
            <p className="text-xs font-medium text-black/60 uppercase tracking-wide">
              Solved
            </p>
            <p className="text-3xl font-bold text-blue-700 mt-2">{totalSolved}</p>
          </div>
          <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm">
            <p className="text-xs font-medium text-black/60 uppercase tracking-wide">
              Correct
            </p>
            <p className="text-3xl font-bold text-green-700 mt-2">{totalCorrect}</p>
          </div>
          <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm">
            <p className="text-xs font-medium text-black/60 uppercase tracking-wide">
              Skipped
            </p>
            <p className="text-3xl font-bold text-gray-700 mt-2">{totalSkipped}</p>
          </div>
          <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm">
            <p className="text-xs font-medium text-black/60 uppercase tracking-wide">
              Trusted vs AI
            </p>
            <p className="text-3xl font-bold text-dark-blue mt-2">
              {sourceStats["trusted-bank"].solved}/{sourceStats["ai-freeform"].solved}
            </p>
          </div>
        </div>

        {/* Confidence Analysis */}
        <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-dark-blue mb-4">
            Confidence Level Analysis
          </h2>
          <p className="text-sm text-black/60 mb-4">
            Understanding your confidence patterns helps AI recommend better questions
            for your learning style.
          </p>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-red-50 rounded border border-red-200">
              <p className="text-xs font-medium text-red-900 uppercase tracking-wide mb-2">
                Low Confidence (0-1)
              </p>
              <p className="text-2xl font-bold text-red-700">{lowConfidence.length}</p>
              <p className="text-xs text-red-700 mt-2">
                {lowConfidence.length > 0
                  ? `${Math.round(
                      (lowConfidence.filter((a) => a.isCorrect).length /
                        lowConfidence.length) *
                        100
                    )}% correct`
                  : "No attempts yet"}
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-xs font-medium text-yellow-900 uppercase tracking-wide mb-2">
                Mid Confidence (2-3)
              </p>
              <p className="text-2xl font-bold text-yellow-700">{midConfidence.length}</p>
              <p className="text-xs text-yellow-700 mt-2">
                {midConfidence.length > 0
                  ? `${Math.round(
                      (midConfidence.filter((a) => a.isCorrect).length /
                        midConfidence.length) *
                        100
                    )}% correct`
                  : "No attempts yet"}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded border border-green-200">
              <p className="text-xs font-medium text-green-900 uppercase tracking-wide mb-2">
                High Confidence (4-5)
              </p>
              <p className="text-2xl font-bold text-green-700">
                {highConfidence.length}
              </p>
              <p className="text-xs text-green-700 mt-2">
                {highConfidence.length > 0
                  ? `${Math.round(
                      (highConfidence.filter((a) => a.isCorrect).length /
                        highConfidence.length) *
                        100
                    )}% correct`
                  : "No attempts yet"}
              </p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { level: 0, label: "No Idea", attempts: noIdeaAttempts, color: "red" },
              { level: 1, label: "Wild Guess", attempts: guessAttempts, color: "orange" },
              { level: 2, label: "Unsure", attempts: unsureAttempts, color: "yellow" },
              { level: 3, label: "Leaning", attempts: leaningAttempts, color: "lime" },
              {
                level: 4,
                label: "Confident",
                attempts: confidentAttempts,
                color: "green",
              },
              {
                level: 5,
                label: "Absolutely",
                attempts: absolutelyConfidentAttempts,
                color: "emerald",
              },
            ].map(({ level, label, attempts: levelAttempts }) => (
              <div
                key={level}
                className="p-3 bg-soft-white-blue/60 rounded border border-soft-white-blue"
              >
                <p className="text-xs font-medium text-black/70 mb-2">
                  {level}: {label}
                </p>
                <p className="text-lg font-bold text-dark-blue">{levelAttempts.length}</p>
                {levelAttempts.length > 0 && (
                  <p className="text-xs text-black/60">
                    {Math.round(
                      (levelAttempts.filter((a) => a.isCorrect).length /
                        levelAttempts.length) *
                        100
                    )}
                    % correct
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* AI Recommendations */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">
              AI Recommendations
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              {noIdeaAttempts.length > 3 && (
                <li>
                  • You have {noIdeaAttempts.length} &quot;no idea&quot; (level 0)
                  attempts. Consider reviewing fundamentals for these topics.
                </li>
              )}
              {midConfidence.length > 5 && (
                <li>
                  • You&apos;re unsure on {midConfidence.length} questions (level 2-3).
                  These indicate partial understanding - good candidates for deeper
                  study.
                </li>
              )}
              {highConfidence.length > 0 &&
                highConfidence.filter((a) => !a.isCorrect).length > 0 && (
                  <li>
                    • You were highly confident (level 4-5) but wrong on{" "}
                    {highConfidence.filter((a) => !a.isCorrect).length} questions. Watch
                    out for misconceptions!
                  </li>
                )}
              {guessAttempts.length > 0 &&
                guessAttempts.filter((a) => a.isCorrect).length / guessAttempts.length >
                  0.5 && (
                  <li>
                    • Your wild guesses (level 1) are{" "}
                    {Math.round(
                      (guessAttempts.filter((a) => a.isCorrect).length /
                        guessAttempts.length) *
                        100
                    )}
                    % accurate. You might understand more than you think!
                  </li>
                )}
              {attempts.length > 10 && (
                <li>
                  • Average confidence:{" "}
                  {(
                    attempts.reduce((sum, a) => sum + a.confidenceLevel, 0) /
                    attempts.length
                  ).toFixed(1)}
                  /5.0
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Weak Topics */}
        <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-dark-blue mb-4">
            Weak Topics (lowest accuracy first)
          </h2>
          <div className="space-y-3">
            {weakTopics.length === 0 ? (
              <p className="text-sm text-black/60">
                No topics analyzed yet. Generate some quizzes first!
              </p>
            ) : (
              weakTopics.map((stat) => (
                <div
                  key={stat.topic}
                  className="p-4 bg-soft-white-blue rounded border border-soft-white-blue"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-dark-blue">{stat.topic}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        stat.accuracy >= 70
                          ? "bg-green-100 text-green-700"
                          : stat.accuracy >= 40
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {stat.accuracy}% accuracy
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-black/60">
                    <span>Generated: {stat.generated}</span>
                    <span>Solved: {stat.solved}</span>
                    <span>Correct: {stat.correct}</span>
                    <span>Skipped: {stat.skipped}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Source Effectiveness */}
        <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-dark-blue mb-4">
            Source Effectiveness
          </h2>
          <div className="space-y-3">
            {sourceEffectiveness.map((stat) => (
              <div
                key={stat.source}
                className="p-4 bg-soft-white-blue rounded border border-soft-white-blue"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-dark-blue">
                    {stat.source === "trusted-bank" ? "Trusted Bank" : "AI Freeform"}
                  </p>
                  <span className="text-xs px-2 py-1 rounded font-medium bg-blue-100 text-blue-700">
                    {stat.accuracy}% accuracy
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-black/60">
                  <span>Generated: {stat.generated}</span>
                  <span>Solved: {stat.solved}</span>
                  <span>Correct: {stat.correct}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-dark-blue mb-4">
            Difficulty Breakdown
          </h2>
          <div className="space-y-3">
            {difficultyBreakdown.length === 0 ? (
              <p className="text-sm text-black/60">No difficulty data yet.</p>
            ) : (
              difficultyBreakdown.map((stat) => (
                <div
                  key={stat.difficulty}
                  className="p-4 bg-soft-white-blue rounded border border-soft-white-blue"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-dark-blue">
                      {stat.difficulty}
                    </p>
                    <span className="text-xs px-2 py-1 rounded font-medium bg-purple-100 text-purple-700">
                      {stat.solved}/{stat.generated} solved
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
