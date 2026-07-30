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
        this.onStateChange = null; // Callback for UI
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.setState('loading');
        this.buffer.changeDifficulty(difficulty).then(() => {
            this.nextQuestion();
        });
    }

    start(difficulty = DIFFICULTIES.EASY) {
        this.setDifficulty(difficulty);
    }

    nextQuestion() {
        this.currentQuestion = this.buffer.getNext();
        if (this.currentQuestion) {
            this.questionNumber++;
            this.setState('show_question');
        } else {
            this.setState('loading');
            // Buffer will auto-fetch and we need to poll or use events.
            // For simplicity in this demo, just retry after a short delay
            setTimeout(() => {
                if (this.state === 'loading') this.nextQuestion();
            }, 500);
        }
    }

    answer(selectedIndex) {
        if (this.state !== 'show_question') return;

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
        setTimeout(() => {
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
