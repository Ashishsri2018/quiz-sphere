import { QuizEngine } from './engine/quiz-engine.js?v=2';
import { Renderer } from './ui/renderer.js?v=2';
import { ScoreDisplay } from './ui/score-display.js?v=2';
import { SettingsManager } from './ui/settings-manager.js?v=2';
import { ApiKeyModal } from './ui/api-key-modal.js?v=2';
import { DIFFICULTIES } from './utils/constants.js?v=2';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize API Key Modal and expose globally for providers to access
    window.apiKeyManager = new ApiKeyModal();

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
