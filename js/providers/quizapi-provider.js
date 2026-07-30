import { BaseProvider } from './base-provider.js';
import { shuffle } from '../utils/shuffler.js';

export class QuizAPIProvider extends BaseProvider {
    get name() {
        return 'QuizAPI (Tech)';
    }

    async getApiKey() {
        let key = localStorage.getItem('quizapi_key');
        if (!key) {
            if (window.apiKeyManager) {
                key = await window.apiKeyManager.requestKey('quizapi_key');
            } else {
                key = prompt('Enter your QuizAPI.io key (free tier):');
                if (key) {
                    localStorage.setItem('quizapi_key', key);
                }
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
                headers: { 'Authorization': 'Bearer ' + key },
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

        const json = await res.json();
        
        let questionsArray = [];
        if (json.success && Array.isArray(json.data)) {
            questionsArray = json.data;
        } else if (Array.isArray(json)) {
            questionsArray = json; // Fallback in case it sometimes returns direct array
        } else {
            throw new Error('Invalid response format');
        }

        return questionsArray.map(q => {
            // Check if it's the new format
            if (q.text && Array.isArray(q.answers)) {
                const correctObj = q.answers.find(a => a.isCorrect);
                const correctAnswerStr = correctObj ? correctObj.text : q.answers[0].text;
                const allPossible = q.answers.map(a => a.text);
                const allAnswers = shuffle(allPossible);

                return {
                    question: q.text,
                    type: 'multiple',
                    correctAnswer: String(correctAnswerStr),
                    allAnswers: allAnswers.map(String),
                    difficulty: String(q.difficulty || difficulty).toLowerCase(),
                    category: q.category || 'Technology',
                    provider: this.name
                };
            }

            // Fallback for old format just in case
            let correctAnswerStr = '';
            let correctAnswerKey = '';
            if (q.correct_answers) {
                for (const [k, v] of Object.entries(q.correct_answers)) {
                    if (v === 'true') {
                        correctAnswerKey = k.replace('_correct', '');
                        correctAnswerStr = q.answers[correctAnswerKey] || '';
                        break;
                    }
                }
            }

            const allPossible = [];
            if (q.answers) {
                for (const [k, v] of Object.entries(q.answers)) {
                    if (v !== null && typeof v === 'string') allPossible.push(v);
                }
            }
            
            if (allPossible.length < 2) {
                allPossible.push('True', 'False');
                if (!correctAnswerStr) correctAnswerStr = 'True';
            }

            if (!correctAnswerStr && allPossible.length > 0) {
                correctAnswerStr = allPossible[0];
            }

            const allAnswers = shuffle(allPossible);

            return {
                question: q.question,
                type: 'multiple',
                correctAnswer: String(correctAnswerStr),
                allAnswers: allAnswers.map(String),
                difficulty: String(q.difficulty || difficulty).toLowerCase(),
                category: q.category || 'Technology',
                provider: this.name
            };
        });
    }
}
