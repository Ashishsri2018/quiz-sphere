import { BaseProvider } from './base-provider.js';
import { shuffle } from '../utils/shuffler.js';

export class QuizAPIProvider extends BaseProvider {
    get name() {
        return 'QuizAPI (Tech)';
    }

    async getApiKey() {
        let key = localStorage.getItem('quizapi_key');
        if (!key) {
            key = prompt('Enter your QuizAPI.io key (free tier):');
            if (key) {
                localStorage.setItem('quizapi_key', key);
            }
        }
        return key;
    }

    async fetchQuestions(difficulty, amount) {
        const key = await this.getApiKey();
        if (!key) {
            throw new Error('API key not provided');
        }

        const url = `https://quizapi.io/api/v1/questions?limit=${amount}&difficulty=${difficulty}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        let res;
        try {
            res = await fetch(url, {
                headers: { 'X-Api-Key': key },
                signal: controller.signal
            });
        } finally {
            clearTimeout(timeoutId);
        }

        if (!res.ok) {
            if (res.status === 401) {
                localStorage.removeItem('quizapi_key');
                throw new Error('Unauthorized - Invalid API key');
            }
            if (res.status === 429) throw new Error('Rate limited');
            throw new Error(`HTTP error: ${res.status}`);
        }

        const data = await res.json();
        
        if (!Array.isArray(data)) {
            throw new Error('Invalid response format');
        }

        return data.map(q => {
            // Find correct answer
            let correctAnswerStr = '';
            let correctAnswerKey = '';
            for (const [k, v] of Object.entries(q.correct_answers)) {
                if (v === 'true') {
                    correctAnswerKey = k.replace('_correct', '');
                    correctAnswerStr = q.answers[correctAnswerKey] || '';
                    break;
                }
            }

            // Gather all answers
            const allPossible = [];
            for (const [k, v] of Object.entries(q.answers)) {
                if (v !== null) allPossible.push(v);
            }
            
            // If we somehow didn't get enough options, fallback logic
            if (allPossible.length < 2) {
                allPossible.push('True', 'False');
                if (!correctAnswerStr) correctAnswerStr = 'True';
            }

            // In QuizAPI there can be multiple correct. We just take the first one we found.
            if (!correctAnswerStr && allPossible.length > 0) {
                correctAnswerStr = allPossible[0];
            }

            const allAnswers = shuffle(allPossible);

            return {
                question: q.question,
                type: 'multiple',
                correctAnswer: String(correctAnswerStr),
                allAnswers: allAnswers.map(String),
                difficulty: q.difficulty || difficulty,
                category: q.category || 'Technology',
                provider: this.name
            };
        });
    }
}
