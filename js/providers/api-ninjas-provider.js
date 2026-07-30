import { BaseProvider } from './base-provider.js';
import { shuffle } from '../utils/shuffler.js';

const FALLBACK_WRONG_ANSWERS = [
    "None of the above", "All of the above", "Unknown", "42", "Paris", "London", "Mars", "Jupiter",
    "Shakespeare", "Einstein", "Newton", "George Washington", "Abraham Lincoln", "Blue", "Red", "Green"
];

export class ApiNinjasProvider extends BaseProvider {
    get name() {
        return 'API Ninjas';
    }

    async getApiKey() {
        let key = localStorage.getItem('apininjas_key');
        if (!key) {
            key = prompt('Enter your API Ninjas key (free tier):');
            if (key) {
                localStorage.setItem('apininjas_key', key);
            }
        }
        return key;
    }

    async fetchQuestions(difficulty, amount) {
        const key = await this.getApiKey();
        if (!key) {
            throw new Error('API key not provided');
        }

        // API Ninjas doesn't strictly use easy/medium/hard in their trivia endpoint in the same way,
        // but we'll request a batch and map them.
        const url = `https://api.api-ninjas.com/v1/trivia?limit=${amount}`;
        
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
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('apininjas_key');
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
            const correctAnswer = String(q.answer);
            
            // Generate 3 random wrong answers since API Ninjas only gives the right one
            const wrongAnswers = [];
            const pool = [...FALLBACK_WRONG_ANSWERS];
            while (wrongAnswers.length < 3 && pool.length > 0) {
                const idx = Math.floor(Math.random() * pool.length);
                const choice = pool.splice(idx, 1)[0];
                if (choice.toLowerCase() !== correctAnswer.toLowerCase()) {
                    wrongAnswers.push(choice);
                }
            }

            const allAnswers = shuffle([correctAnswer, ...wrongAnswers]);

            return {
                question: q.question,
                type: 'multiple',
                correctAnswer: correctAnswer,
                allAnswers: allAnswers,
                difficulty: difficulty, // They don't provide difficulty, use requested
                category: q.category || 'General Knowledge',
                provider: this.name
            };
        });
    }
}
