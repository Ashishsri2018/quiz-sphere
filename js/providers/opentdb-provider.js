import { BaseProvider } from './base-provider.js';
import { decodeHtmlEntities } from '../utils/html-decoder.js';
import { shuffle } from '../utils/shuffler.js';

export class OpenTDBProvider extends BaseProvider {
    constructor() {
        super();
        this.sessionToken = null;
    }

    get name() {
        return 'OpenTDB';
    }

    async initToken() {
        if (this.sessionToken) return;
        try {
            const res = await fetch('https://opentdb.com/api_token.php?command=request');
            const data = await res.json();
            if (data.response_code === 0) {
                this.sessionToken = data.token;
            }
        } catch (e) {
            console.warn('Failed to get OpenTDB token:', e);
        }
    }

    async fetchQuestions(difficulty, amount) {
        await this.initToken();
        
        let url = `https://opentdb.com/api.php?amount=${amount}&difficulty=${difficulty}`;
        if (this.sessionToken) {
            url += `&token=${this.sessionToken}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        let res;
        try {
            res = await fetch(url, { signal: controller.signal });
        } finally {
            clearTimeout(timeoutId);
        }

        if (!res.ok) {
            if (res.status === 429) throw new Error('Rate limited');
            throw new Error(`HTTP error: ${res.status}`);
        }

        const data = await res.json();
        
        if (data.response_code === 3 || data.response_code === 4) {
            // Token expired or exhausted, reset it next time
            this.sessionToken = null;
            throw new Error('Token exhausted');
        }
        
        if (data.response_code === 5) {
            throw new Error('Rate limited');
        }

        if (data.response_code !== 0 || !data.results) {
            throw new Error(`API error code: ${data.response_code}`);
        }

        return data.results.map(q => {
            const correctAnswer = decodeHtmlEntities(q.correct_answer);
            const incorrectAnswers = q.incorrect_answers.map(a => decodeHtmlEntities(a));
            const allAnswers = shuffle([correctAnswer, ...incorrectAnswers]);

            return {
                question: decodeHtmlEntities(q.question),
                type: q.type,
                correctAnswer: correctAnswer,
                allAnswers: allAnswers,
                difficulty: q.difficulty,
                category: decodeHtmlEntities(q.category),
                provider: this.name
            };
        });
    }
}
