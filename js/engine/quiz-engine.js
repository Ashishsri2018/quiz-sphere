import { QuestionBuffer } from './question-buffer.js';
import { DIFFICULTIES, CONFIG } from '../utils/constants.js';

export class QuizEngine {
    constructor() {
        this.buffer = new QuestionBuffer();
        this.state = 'idle'; // idle | loading | show_question | answered
        this.currentQuestion = null;
        this.questionNumber = 0;
        this.score = {
            correct: 0,
            wrong: 0,
            streak: 0,
            bestStreak: 0
        };
        this.difficulty = DIFFICULTIES.EASY;
        this.provider = 'all';
        this.onStateChange = null; // Callback for UI
        this.pollTimer = null;
        this.autoAdvanceTimer = null;
    }

    clearTimers() {
        if (this.pollTimer) clearTimeout(this.pollTimer);
        if (this.autoAdvanceTimer) clearTimeout(this.autoAdvanceTimer);
    }

    /**
     * Change settings on the fly without resetting score.
     * Flushes the buffer to fetch new questions with the updated settings.
     */
    changeSettings(difficulty, provider) {
        this.difficulty = difficulty;
        this.provider = provider;
        this.setState('loading');
        this.clearTimers();
        this.buffer.changeSettings(difficulty, provider).then(() => {
            this.nextQuestion();
        });
    }

    start(difficulty = DIFFICULTIES.EASY) {
        this.score = { correct: 0, wrong: 0, streak: 0, bestStreak: 0 };
        this.questionNumber = 0;
        this.changeSettings(difficulty, this.provider);
    }

    nextQuestion(retries = 10) {
        this.clearTimers();
        this.currentQuestion = this.buffer.getNext();
        if (this.currentQuestion) {
            this.questionNumber++;
            this.setState('show_question');
        } else {
            if (retries <= 0) {
                this.setState('error');
                return;
            }
            this.setState('loading');
            this.pollTimer = setTimeout(() => {
                if (this.state === 'loading') this.nextQuestion(retries - 1);
            }, 500);
        }
    }

    answer(selectedIndex) {
        if (this.state !== 'show_question') return;

        this.clearTimers();

        const selectedAnswer = this.currentQuestion.allAnswers[selectedIndex];
        const isCorrect = selectedAnswer === this.currentQuestion.correctAnswer;

        if (isCorrect) {
            this.score.correct++;
            this.score.streak++;
            if (this.score.streak > this.score.bestStreak) {
                this.score.bestStreak = this.score.streak;
            }
        } else {
            this.score.wrong++;
            this.score.streak = 0;
        }

        this.setState('answered', { selectedIndex, isCorrect });

        // Auto-advance
        this.autoAdvanceTimer = setTimeout(() => {
            if (this.state === 'answered') {
                this.nextQuestion();
            }
        }, CONFIG.AUTO_ADVANCE_DELAY_MS);
    }

    setState(newState, payload = null) {
        this.state = newState;
        if (this.onStateChange) {
            this.onStateChange(this.state, payload);
        }
    }
}
