import { Controller, Post, Body } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';

@Controller('api/ai')
export class AiController {
  @Public()
  @Post('generate-quiz')
  async generateQuiz(@Body() body: any) {
    const topic = body.topic || 'General';
    const count = body.count || 3;

    const questions = [];
    for (let i = 0; i < count; i++) {
      questions.push({
        id: `q-${Date.now()}-${i}`,
        question: `${topic} question ${i + 1}`,
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 0,
        explanation: 'Demo explanation',
        source: body.source || 'ai-freeform',
        topic,
        difficulty: body.difficulty || 'Intro / warm-up',
        createdAt: new Date().toISOString(),
      });
    }

    return {
      quizId: `quiz-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      topic,
      difficulty: body.difficulty || 'Intro / warm-up',
      questions,
    };
  }
}
