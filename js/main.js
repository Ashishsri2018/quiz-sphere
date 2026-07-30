import { QuizEngine } from './engine/quiz-engine.js';
import { Renderer } from './ui/renderer.js';
import { ScoreDisplay } from './ui/score-display.js';
import { SettingsManager } from './ui/settings-manager.js';
import { DIFFICULTIES } from './utils/constants.js';

document.addEventListener('DOMContentLoaded', () => {
    const engine = new QuizEngine();
    const scoreDisplay = new ScoreDisplay();
    const renderer = new Renderer('quiz-card', (index) => {
        engine.answer(index);
    });
    
    const settings = new SettingsManager('settings-bar', (difficulty, provider) => {
        engine.changeSettings(difficulty, provider);
    });
    
    // Wire UI updates to engine state changes
    engine.onStateChange = (state, payload) => {
        if (state === 'loading') {
            renderer.renderLoading();
        } 
        else if (state === 'show_question') {
            renderer.renderQuestion(engine.currentQuestion, engine.questionNumber);
        }
        else if (state === 'answered') {
            scoreDisplay.update(engine.score);
            
            // Find correct answer index
            const correctIdx = engine.currentQuestion.allAnswers.indexOf(engine.currentQuestion.correctAnswer);
            renderer.showFeedback(payload.selectedIndex, payload.isCorrect, correctIdx);
        }
        else if (state === 'error') {
            renderer.renderError(() => {
                engine.start(engine.difficulty);
            });
        }
    };
    
    // Init UI
    settings.render(DIFFICULTIES.EASY, 'all');
    
    // Start Game
    engine.start(DIFFICULTIES.EASY);
});
