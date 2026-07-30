import { DIFFICULTIES } from '../utils/constants.js';

export class DifficultyBar {
    constructor(containerId, onSelect) {
        this.container = document.getElementById(containerId);
        this.onSelect = onSelect;
        this.currentDifficulty = null;
    }

    render(activeDifficulty = DIFFICULTIES.EASY) {
        this.currentDifficulty = activeDifficulty;
        this.container.innerHTML = '';
        
        Object.values(DIFFICULTIES).forEach(diff => {
            const pill = document.createElement('button');
            pill.className = `diff-pill ${diff}`;
            pill.setAttribute('role', 'button');
            pill.setAttribute('aria-pressed', diff === activeDifficulty ? 'true' : 'false');
            if (diff === activeDifficulty) pill.classList.add('active');
            
            // Emoji mapping
            const emoji = diff === 'easy' ? '🟢' : (diff === 'medium' ? '🟡' : '🔴');
            const label = diff.charAt(0).toUpperCase() + diff.slice(1);
            
            pill.innerHTML = `${label} <span aria-hidden="true">${emoji}</span>`;
            
            pill.addEventListener('click', () => {
                if (this.currentDifficulty !== diff) {
                    this.render(diff);
                    this.onSelect(diff);
                }
            });
            
            this.container.appendChild(pill);
        });
    }
}
