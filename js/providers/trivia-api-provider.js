import { BaseProvider } from './base-provider.js';
import { shuffle } from '../utils/shuffler.js';

export class TriviaAPIProvider extends BaseProvider {
    get name() {
        return 'The Trivia API';
    }

    async fetchQuestions(difficulty, amount) {
        const url = `https://the-trivia-api.com/v2/questions?limit=${amount}&difficulties=${difficulty}`;
        
        const res = await fetch(url);
        if (!res.ok) {
            if (res.status === 429) throw new Error('Rate limited');
            throw new Error(`HTTP error: ${res.status}`);
        }

        const data = await res.json();
        
        if (!Array.isArray(data)) {
            throw new Error('Invalid response format');
        }

        return data.map(q => {
            const questionText = q.question && q.question.text ? q.question.text : String(q.question);
            const correctAnswer = String(q.correctAnswer);
            const incorrectAnswers = q.incorrectAnswers.map(a => String(a));
            const allAnswers = shuffle([correctAnswer, ...incorrectAnswers]);

            // Map their specific types to our normalized types
            const normalizedType = q.type === 'multiple_choice' ? 'multiple' : 'multiple';

            return {
                question: questionText,
                type: normalizedType,
                correctAnswer: correctAnswer,
                allAnswers: allAnswers,
                difficulty: q.difficulty || difficulty,
                category: q.category,
                provider: this.name
            };
        });
    }
}
