import { NextResponse } from "next/server";

type QuizItem = {
  id: string;
  question: string;
  options: string[];
  correctIndex?: number;
  explanation?: string;
  source: string;
  topic: string;
  difficulty: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

type QuizBundle = {
  quizId: string;
  generatedAt: string;
  topic: string;
  difficulty: string;
  questions: QuizItem[];
  metadata?: Record<string, unknown>;
};

// In-memory store for demo purposes only
const QUIZ_STORE: Record<string, QuizBundle> = {};

export async function POST(request: Request) {
  try {
    const body = (await request.json?.()) || {};
    const topic = body.topic || "General";
    const difficulty = body.difficulty || "Intro / warm-up";
    const source = body.source || "trusted-bank";
    const count = Number(body.count) || 3;
    const options = body.options || {};

    if (!topic) {
      return NextResponse.json({ error: "Missing required field: topic" }, { status: 400 });
    }

    const now = Date.now();
    const generatedAt = new Date(now).toISOString();
    const questions: QuizItem[] = [];

    for (let i = 0; i < Math.max(1, Math.min(20, count)); i++) {
      const q: QuizItem = {
        id: `q-${now}-${i}`,
        question: `${topic} — Sample question ${i + 1} (${difficulty})`,
        options: [
          "Option A - example",
          "Option B - example",
          "Option C - example",
          "Option D - example",
        ],
        correctIndex: options.includeAnswers ? 1 : undefined,
        explanation: options.includeAnswers ? "Demo explanation for answer." : undefined,
        source,
        topic,
        difficulty,
        createdAt: generatedAt,
      };
      questions.push(q);
    }

    const quizId = `quiz-${now}-${Math.floor(Math.random() * 10000)}`;
    const bundle: QuizBundle = {
      quizId,
      generatedAt,
      topic,
      difficulty,
      questions,
    };

    // store bundle in-memory for demo retrieve
    QUIZ_STORE[quizId] = bundle;

    return NextResponse.json(bundle, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id query param" }, { status: 400 });
    }
    const bundle = QUIZ_STORE[id];
    if (!bundle) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(bundle, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
