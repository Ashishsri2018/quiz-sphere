import { QuizEngine } from './engine/quiz-engine.js?v=3';
import { Renderer } from './ui/renderer.js?v=3';
import { ScoreDisplay } from './ui/score-display.js?v=3';
import { SettingsManager } from './ui/settings-manager.js?v=3';
import { SettingsModal } from './ui/settings-modal.js?v=3';
import { ThemeSwitcher } from './ui/theme-switcher.js?v=3';
import { DIFFICULTIES } from './utils/constants.js?v=3';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Unified Settings Modal
    const settingsModal = new SettingsModal('settings-dialog');
    window.apiKeyManager = settingsModal; // Expose globally for providers to access API keys

    const engine = new QuizEngine();
    const scoreDisplay = new ScoreDisplay();

    const enabledProviders = settingsModal.getEnabledProviders();
    engine.buffer.providerManager.updateEnabledProviders(enabledProviders);

    const btnOpenSettings = document.getElementById('btn-open-settings');
    if (btnOpenSettings) {
        btnOpenSettings.addEventListener('click', () => settingsModal.open());
    }
    
    // Initialize Theme Switcher
    const themeSwitcher = new ThemeSwitcher('btn-theme-toggle');

    const renderer = new Renderer('quiz-card', (index) => {
        engine.answer(index);
    });
    
    const settings = new SettingsManager('settings-bar', (difficulty, provider) => {
        engine.changeSettings(difficulty, provider);
    });
    settings.setEnabledProviders(enabledProviders);
    
    // When provider settings change, update everything
    settingsModal.onChange((newEnabled) => {
        settings.setEnabledProviders(newEnabled);
        engine.buffer.providerManager.updateEnabledProviders(newEnabled);
        
        // If current provider is now disabled, switch to 'all'
        if (settings.currentProvider !== 'all' && !newEnabled.includes(settings.currentProvider)) {
            settings.currentProvider = 'all';
            settings.emitChange();
        }
        
        settings.render(settings.currentDifficulty, settings.currentProvider);
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
