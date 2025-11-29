"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { QuizSource, QuizStatus, QuizDifficulty, QuizItem } from "@/types";

type AttemptRecord = {
  quizId: string;
  userAnswer: string; // User's selected option (A, B, C, or D)
  confidenceLevel: number; // 0-5 scale, how confident the user is
  fluctuateBetween?: string[]; // If low confidence (0-2), which options they considered
  reasoning?: string; // Optional: User's reasoning or notes
  isCorrect: boolean;
  timeSpentSec: number;
  createdAt: string;
};

export default function AIQuizMyQuestionsPage() {
  const [myQuizzes, setMyQuizzes] = useState<QuizItem[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterTopic, setFilterTopic] = useState("ALL");
  const [filterSource, setFilterSource] = useState("ALL");
  const [solvingQuiz, setSolvingQuiz] = useState<QuizItem | null>(null);
  const [viewingAnswer, setViewingAnswer] = useState<{
    quiz: QuizItem;
    attempt: AttemptRecord;
  } | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState<number>(3);
  const [fluctuateOptions, setFluctuateOptions] = useState<string[]>([]);
  const [reasoning, setReasoning] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const quizzes = JSON.parse(localStorage.getItem("myQuizzes") || "[]");
      const savedAttempts = JSON.parse(localStorage.getItem("quizAttempts") || "[]");
      setMyQuizzes(quizzes);
      setAttempts(savedAttempts);
    }
  }, []);

  const filteredQuizzes = myQuizzes.filter((q) => {
    if (filterStatus !== "ALL" && q.status !== filterStatus) return false;
    if (filterTopic !== "ALL" && !q.topic.includes(filterTopic)) return false;
    if (filterSource !== "ALL" && q.source !== filterSource) return false;
    return true;
  });

  const handleSkip = (id: string) => {
    const updated = myQuizzes.map((q) =>
      q.id === id ? { ...q, status: "skipped" as QuizStatus } : q
    );
    setMyQuizzes(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("myQuizzes", JSON.stringify(updated));
    }
  };

  const handleDelete = (id: string) => {
    const updated = myQuizzes.filter((q) => q.id !== id);
    setMyQuizzes(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("myQuizzes", JSON.stringify(updated));
    }
  };

  const handleOpenSolve = (quiz: QuizItem) => {
    setSolvingQuiz(quiz);
    setUserAnswer("");
    setConfidenceLevel(3);
    setFluctuateOptions([]);
    setReasoning("");
    setShowResult(false);
    setIsCorrect(false);
    setShowExplanation(false);
  };

  const handleViewAnswer = (quiz: QuizItem) => {
    const attempt = attempts.find((a) => a.quizId === quiz.id);
    if (attempt) {
      setViewingAnswer({ quiz, attempt });
    }
  };

  const handleSubmitAnswer = () => {
    if (!solvingQuiz) return;

    // If no idea (0-1), allow submission without answer
    if (confidenceLevel <= 1 && !userAnswer) {
      // Auto-select a random wrong answer for tracking
      const options = ["A", "B", "C", "D"];
      const wrongOptions = options.filter((opt) => opt !== solvingQuiz.correctAnswer);
      setUserAnswer(wrongOptions[0]);
    }

    if (!userAnswer) return;

    const correct = userAnswer === solvingQuiz.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    const attempt: AttemptRecord = {
      quizId: solvingQuiz.id,
      userAnswer,
      confidenceLevel,
      fluctuateBetween:
        confidenceLevel <= 2 && fluctuateOptions.length > 0
          ? fluctuateOptions
          : undefined,
      reasoning: reasoning.trim() || undefined,
      isCorrect: correct,
      timeSpentSec: 0,
      createdAt: new Date().toLocaleString("en-US"),
    };

    const updatedAttempts = [...attempts, attempt];
    setAttempts(updatedAttempts);
    
    if (typeof window !== "undefined") {
      localStorage.setItem("quizAttempts", JSON.stringify(updatedAttempts));
    }

    const updatedQuizzes = myQuizzes.map((q) =>
      q.id === solvingQuiz.id ? { ...q, status: "solved" as QuizStatus } : q
    );
    setMyQuizzes(updatedQuizzes);
    
    if (typeof window !== "undefined") {
      localStorage.setItem("myQuizzes", JSON.stringify(updatedQuizzes));
    }
  };

  const handleCloseSolveModal = () => {
    setSolvingQuiz(null);
    setUserAnswer("");
    setConfidenceLevel(3);
    setFluctuateOptions([]);
    setReasoning("");
    setShowResult(false);
    setIsCorrect(false);
    setShowExplanation(false);
  };

  const getConfidenceLabel = (level: number): string => {
    const labels = [
      "Absolutely no idea",
      "Wild guess",
      "Somewhat unsure",
      "Leaning towards an answer",
      "Pretty confident",
      "Absolutely confident",
    ];
    return labels[level] || "Unknown";
  };

  const toggleFluctuateOption = (option: string) => {
    setFluctuateOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const getStatusColor = (status: QuizStatus) => {
    if (status === "solved") return "bg-green-100 text-green-700 border-green-200";
    if (status === "skipped") return "bg-gray-100 text-gray-700 border-gray-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue py-6">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mb-6">
        <h1 className="text-2xl font-semibold text-dark-blue mb-2">My AI Quizzes</h1>
        <p className="text-sm text-black/70 max-w-2xl">
          Review generated questions. Skip ones you don&apos;t like, or solve them to
          track your progress.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-dark-blue mb-3">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-dark-blue mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-black/10 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option>ALL</option>
                <option>new</option>
                <option>solved</option>
                <option>skipped</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-blue mb-1">
                Topic
              </label>
              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="w-full border border-black/10 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option>ALL</option>
                <option>CO1001</option>
                <option>MA1001</option>
                <option>Digital Systems</option>
                <option>Data structures</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-blue mb-1">
                Source
              </label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full border border-black/10 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option>ALL</option>
                <option>trusted-bank</option>
                <option>ai-freeform</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quiz List */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-dark-blue">
            {filteredQuizzes.length} question
            {filteredQuizzes.length !== 1 ? "s" : ""}
          </p>
          {filteredQuizzes.length === 0 ? (
            <div className="bg-white rounded-xl border border-black/5 p-8 text-center">
              <p className="text-black/60">No questions match your filters.</p>
              <Link
                href="/student/ai-quiz"
                className="inline-block mt-4 text-sm px-4 py-2 bg-light-heavy-blue text-white rounded hover:bg-[#00539a] transition"
              >
                Generate Questions
              </Link>
            </div>
          ) : (
            filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-xl border border-black/5 p-5 shadow-sm"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-dark-blue mb-2">
                      {quiz.question}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-soft-white-blue text-dark-blue border border-soft-white-blue">
                        {quiz.topic}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-soft-white-blue text-dark-blue border border-soft-white-blue">
                        {quiz.difficulty}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded border ${
                          quiz.source === "trusted-bank"
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-purple-100 text-purple-700 border-purple-200"
                        }`}
                      >
                        {quiz.source === "trusted-bank" ? "Trusted Bank" : "AI Freeform"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded border ${getStatusColor(
                          quiz.status
                        )}`}
                      >
                        {quiz.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-black/50">
                        {quiz.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {quiz.status === "solved" && (
                    <button
                      onClick={() => handleViewAnswer(quiz)}
                      className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
                    >
                      View My Answer
                    </button>
                  )}
                  {quiz.status !== "solved" && (
                    <button
                      onClick={() => handleOpenSolve(quiz)}
                      className="text-xs px-3 py-1.5 bg-light-heavy-blue text-white rounded hover:bg-[#00539a] transition"
                    >
                      Solve
                    </button>
                  )}
                  {quiz.status !== "skipped" && quiz.status !== "solved" && (
                    <button
                      onClick={() => handleSkip(quiz.id)}
                      className="text-xs px-3 py-1.5 bg-soft-white-blue text-dark-blue rounded hover:bg-gray-200 transition"
                    >
                      Skip
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Solve Modal */}
      {solvingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-dark-blue mb-3">
              Solve Question
            </h3>
            <p className="text-sm text-black/70 mb-4">{solvingQuiz.question}</p>

            {/* Confidence Level Slider */}
            {!showResult && (
              <div className="mb-4 p-4 bg-soft-white-blue rounded-lg border border-black/5">
                <label className="block text-sm font-semibold text-dark-blue mb-1">
                  How confident are you?
                </label>
                <p className="text-xs text-black/60 mb-3">
                  Level {confidenceLevel}: {getConfidenceLabel(confidenceLevel)}
                </p>

                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={confidenceLevel}
                    onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        #ef4444 0%, 
                        #f97316 20%, 
                        #eab308 40%, 
                        #84cc16 60%, 
                        #22c55e 80%, 
                        #10b981 100%)`,
                    }}
                  />

                  <div className="flex justify-between text-xs text-black/60">
                    <span>0</span>
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>
                </div>
              </div>
            )}

            {/* Fluctuate Options Selector */}
            {!showResult && confidenceLevel <= 2 && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs font-semibold text-dark-blue mb-2">
                  Which options are you considering? (Optional - Select multiple)
                </p>
                <div className="flex flex-wrap gap-2">
                  {["A", "B", "C", "D"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => toggleFluctuateOption(opt)}
                      className={`px-3 py-1 rounded text-sm font-medium transition ${
                        fluctuateOptions.includes(opt)
                          ? "bg-yellow-500 text-white"
                          : "bg-white text-dark-blue border border-yellow-300 hover:bg-yellow-100"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Reasoning */}
            {!showResult && confidenceLevel > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-dark-blue mb-2">
                  Your reasoning (optional)
                </label>
                <textarea
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  rows={2}
                  placeholder="Explain why you chose this answer..."
                  className="w-full border border-soft-white-blue rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-light-light-blue transition resize-none"
                />
              </div>
            )}

            {/* MCQ Options */}
            <div className="space-y-2 mb-4">
              {solvingQuiz.options.map((option, idx) => {
                const optionLetter = String.fromCharCode(65 + idx);
                const isSelected = userAnswer === optionLetter;
                const isCorrectOption = optionLetter === solvingQuiz.correctAnswer;

                let bgColor = "bg-white hover:bg-soft-white-blue";
                let borderColor = "border-soft-white-blue";

                if (showResult) {
                  if (isCorrectOption) {
                    bgColor = "bg-green-50";
                    borderColor = "border-green-500";
                  } else if (isSelected && !isCorrect) {
                    bgColor = "bg-red-50";
                    borderColor = "border-red-500";
                  }
                } else if (isSelected) {
                  bgColor = "bg-blue-50";
                  borderColor = "border-light-heavy-blue";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!showResult) {
                        setUserAnswer(optionLetter);
                        if (confidenceLevel === 0) {
                          setConfidenceLevel(1);
                        }
                      }
                    }}
                    disabled={showResult || (confidenceLevel === 0 && !showResult)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition ${bgColor} ${borderColor} ${
                      showResult
                        ? "cursor-default"
                        : confidenceLevel === 0
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
                  >
                    <span className="font-semibold text-dark-blue">
                      {optionLetter}.{" "}
                    </span>
                    <span className="text-sm text-black/80">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* No Idea Helper Text */}
            {!showResult && confidenceLevel === 0 && (
              <p className="text-xs text-orange-600 mb-4 px-2">
                💡 If you have absolutely no idea, click &quot;Show Answer&quot; to see
                the answer and explanation.
              </p>
            )}

            {/* Result Display */}
            {showResult && (
              <div
                className={`p-4 rounded-lg mb-4 ${
                  isCorrect
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={`font-semibold mb-2 ${
                    isCorrect ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                </p>
                <p className="text-sm text-black/70">
                  {isCorrect
                    ? `Great job! The correct answer is ${solvingQuiz.correctAnswer}.`
                    : `The correct answer is ${solvingQuiz.correctAnswer}. You selected ${userAnswer}.`}
                </p>
              </div>
            )}

            {/* Explanation Section */}
            {showResult && (
              <div className="mb-4">
                {!showExplanation ? (
                  <button
                    onClick={() => setShowExplanation(true)}
                    className="w-full px-4 py-2 bg-soft-white-blue text-dark-blue rounded text-sm font-medium hover:bg-gray-200 transition"
                  >
                    💡 Show Explanation
                  </button>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">
                      Explanation
                    </p>
                    <p className="text-sm text-black/80">{solvingQuiz.explanation}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseSolveModal}
                className="px-4 py-2 text-sm text-dark-blue hover:bg-soft-white-blue rounded transition"
              >
                {showResult ? "Close" : "Cancel"}
              </button>
              {!showResult && (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer && confidenceLevel > 1}
                  className={`px-4 py-2 rounded text-sm font-medium transition ${
                    userAnswer || confidenceLevel <= 1
                      ? "bg-light-heavy-blue text-white hover:bg-[#00539a]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {confidenceLevel === 0 ? "Show Answer" : "Submit Answer"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Answer Modal */}
      {viewingAnswer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-dark-blue mb-3">
              Your Previous Answer
            </h3>
            <div className="mb-4">
              <p className="text-xs font-medium text-black/60 mb-1">Question:</p>
              <p className="text-sm text-black/70 mb-4">{viewingAnswer.quiz.question}</p>

              {/* Show all options */}
              <p className="text-xs font-medium text-black/60 mb-2">Options:</p>
              <div className="space-y-2 mb-4">
                {viewingAnswer.quiz.options.map((option, idx) => {
                  const optionLetter = String.fromCharCode(65 + idx);
                  const isUserAnswer = optionLetter === viewingAnswer.attempt.userAnswer;
                  const isCorrectAnswer =
                    optionLetter === viewingAnswer.quiz.correctAnswer;

                  let bgColor = "bg-soft-white-blue";
                  let borderColor = "border-soft-white-blue";
                  let label = "";

                  if (isCorrectAnswer) {
                    bgColor = "bg-green-50";
                    borderColor = "border-green-500";
                    label = " ✓ Correct";
                  }

                  if (isUserAnswer && !isCorrectAnswer) {
                    bgColor = "bg-red-50";
                    borderColor = "border-red-500";
                    label = " ✗ Your answer";
                  } else if (isUserAnswer && isCorrectAnswer) {
                    label = " ✓ Your answer";
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor}`}
                    >
                      <span className="font-semibold text-dark-blue">
                        {optionLetter}.{" "}
                      </span>
                      <span className="text-sm text-black/80">{option}</span>
                      {label && (
                        <span className="text-xs font-semibold ml-2">{label}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Result Badge */}
              <div
                className={`p-4 rounded-lg mb-4 ${
                  viewingAnswer.attempt.isCorrect
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={`font-semibold ${
                    viewingAnswer.attempt.isCorrect
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {viewingAnswer.attempt.isCorrect
                    ? "✓ You got this correct!"
                    : "✗ You got this incorrect"}
                </p>

                {/* Confidence Level Display */}
                <div className="mt-3 pt-3 border-t border-black/10">
                  <p className="text-xs font-medium text-black/60 mb-1">
                    Your confidence level:
                  </p>
                  <p className="text-sm text-dark-blue">
                    Level {viewingAnswer.attempt.confidenceLevel}:{" "}
                    {getConfidenceLabel(viewingAnswer.attempt.confidenceLevel)}
                  </p>

                  {viewingAnswer.attempt.confidenceLevel <= 2 &&
                    viewingAnswer.attempt.fluctuateBetween &&
                    viewingAnswer.attempt.fluctuateBetween.length > 0 && (
                      <p className="text-xs text-black/60 mt-1">
                        Considered: {viewingAnswer.attempt.fluctuateBetween.join(", ")}
                      </p>
                    )}

                  {viewingAnswer.attempt.reasoning && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-black/60 mb-1">
                        Your reasoning:
                      </p>
                      <p className="text-sm text-black/70 italic">
                        &quot;{viewingAnswer.attempt.reasoning}&quot;
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">
                  Explanation
                </p>
                <p className="text-sm text-black/80">
                  {viewingAnswer.quiz.explanation}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setViewingAnswer(null)}
                className="px-4 py-2 bg-light-heavy-blue text-white rounded text-sm font-medium hover:bg-[#00539a] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
