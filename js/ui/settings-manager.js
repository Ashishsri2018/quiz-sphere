import { DIFFICULTIES, PROVIDERS } from '../utils/constants.js';

/**
 * Manages difficulty and provider dropdown menus.
 * @param {string} containerId - DOM element ID for the settings bar
 * @param {function} onSettingsChange - Callback: (difficulty, provider) => void
 */
export class SettingsManager {
    constructor(containerId, onSettingsChange) {
        this.container = document.getElementById(containerId);
        this.onSettingsChange = onSettingsChange;
        this.currentDifficulty = DIFFICULTIES.EASY;
        this.currentProvider = PROVIDERS.ALL;
    }

    render(initialDifficulty = DIFFICULTIES.EASY, initialProvider = PROVIDERS.ALL) {
        this.currentDifficulty = initialDifficulty;
        this.currentProvider = initialProvider;
        this.container.innerHTML = '';

        // Difficulty dropdown
        const diffGroup = this.createDropdownGroup(
            'difficulty-select',
            '⚡ Difficulty',
            this.getDifficultyOptions(),
            initialDifficulty,
            (value) => {
                this.currentDifficulty = value;
                this.emitChange();
            }
        );

        // Provider dropdown
        const provGroup = this.createDropdownGroup(
            'provider-select',
            '🌐 Provider',
            this.getProviderOptions(),
            initialProvider,
            (value) => {
                this.currentProvider = value;
                this.emitChange();
            }
        );

        this.container.appendChild(diffGroup);
        this.container.appendChild(provGroup);
    }

    createDropdownGroup(id, labelText, options, selectedValue, onChange) {
        const group = document.createElement('div');
        group.className = 'settings-group';

        const label = document.createElement('label');
        label.className = 'settings-label';
        label.setAttribute('for', id);
        label.textContent = labelText;

        const selectWrap = document.createElement('div');
        selectWrap.className = 'select-wrap';

        const select = document.createElement('select');
        select.id = id;
        select.className = 'settings-select';

        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.value === selectedValue) option.selected = true;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => onChange(e.target.value));

        selectWrap.appendChild(select);
        group.appendChild(label);
        group.appendChild(selectWrap);
        return group;
    }

    getDifficultyOptions() {
        return [
            { value: DIFFICULTIES.EASY, label: '🟢 Easy' },
            { value: DIFFICULTIES.MEDIUM, label: '🟡 Medium' },
            { value: DIFFICULTIES.HARD, label: '🔴 Hard' }
        ];
    }

    getProviderOptions() {
        return [
            { value: PROVIDERS.ALL, label: '🔄 All (Rotate)' },
            { value: PROVIDERS.OPENTDB, label: '📚 OpenTDB' },
            { value: PROVIDERS.TRIVIA_API, label: '🧩 The Trivia API' },
            { value: PROVIDERS.QUIZAPI, label: '💻 QuizAPI (Tech)' },
            { value: PROVIDERS.API_NINJAS, label: '🥷 API Ninjas' },
            { value: PROVIDERS.FALLBACK, label: '💾 Local Fallback' }
        ];
    }

    emitChange() {
        this.onSettingsChange(this.currentDifficulty, this.currentProvider);
    }
}
