import { PROVIDERS, DEFAULT_ENABLED_PROVIDERS } from '../utils/constants.js';

export class SettingsModal {
    constructor(dialogId) {
        this.dialog = document.getElementById(dialogId);
        this.STORAGE_KEY = 'quiz-enabled-providers';
        this.changeCallbacks = [];
        this.providersConfig = [
            { id: PROVIDERS.OPENTDB, name: 'OpenTDB', emoji: '📚', desc: 'General knowledge database' },
            { id: PROVIDERS.TRIVIA_API, name: 'The Trivia API', emoji: '🧩', desc: 'High quality trivia questions' },
            { id: PROVIDERS.QUIZAPI, name: 'QuizAPI (Tech)', emoji: '💻', desc: 'Programming and tech trivia' },
            { id: PROVIDERS.API_NINJAS, name: 'API Ninjas', emoji: '🥷', desc: 'Various trivia categories' },
            { id: PROVIDERS.FALLBACK, name: 'Local Fallback', emoji: '💾', desc: 'Offline question pool', disabled: true }
        ];

        this.currentTab = 'providers'; // 'providers' or 'apikeys'
        this.resolvePromise = null;
        this.requestedProviderKey = null;

        if (this.dialog) {
            this.setupDialogEvents();
        }
    }

    setupDialogEvents() {
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) {
                this.close();
            }
        });
    }

    loadSettings() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                let parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    if (!parsed.includes(PROVIDERS.FALLBACK)) {
                        parsed.push(PROVIDERS.FALLBACK);
                    }
                    return parsed;
                }
            } catch (e) {
                console.warn('Failed to parse provider settings', e);
            }
        }
        return [...DEFAULT_ENABLED_PROVIDERS];
    }

    saveSettings(enabledProviders) {
        if (!enabledProviders.includes(PROVIDERS.FALLBACK)) {
            enabledProviders.push(PROVIDERS.FALLBACK);
        }
        if (enabledProviders.length <= 1) {
            if (typeof alert !== 'undefined') {
                alert("You must have at least one online provider enabled.");
            }
            return false;
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(enabledProviders));
        this.notifyChange(enabledProviders);
        return true;
    }

    getEnabledProviders() {
        return this.loadSettings();
    }

    onChange(callback) {
        this.changeCallbacks.push(callback);
    }

    notifyChange(enabledProviders) {
        this.changeCallbacks.forEach(cb => cb(enabledProviders));
    }

    renderDialog() {
        if (!this.dialog) return;
        
        const content = this.dialog.querySelector('.settings-dialog-content');
        if (!content) return;
        
        content.innerHTML = `
            <h2>⚙️ Settings</h2>
            <div class="settings-tabs" style="margin-bottom: 1.5rem;">
                <button class="settings-tab ${this.currentTab === 'providers' ? 'active' : ''}" data-tab="providers">Providers</button>
                <button class="settings-tab ${this.currentTab === 'apikeys' ? 'active' : ''}" data-tab="apikeys">API Keys</button>
            </div>
            
            ${this.currentTab === 'providers' ? this.renderProvidersTab() : this.renderApiKeysTab()}
        `;
        
        // Tab switching logic
        content.querySelectorAll('.settings-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentTab = e.target.getAttribute('data-tab');
                this.renderDialog();
            });
        });

        // Event listeners for specific tabs
        if (this.currentTab === 'providers') {
            content.querySelector('#btn-settings-cancel').addEventListener('click', () => this.close());
            content.querySelector('#btn-settings-save').addEventListener('click', () => {
                const checkboxes = content.querySelectorAll('.provider-list input[type="checkbox"]');
                const newEnabled = Array.from(checkboxes)
                    .filter(cb => cb.checked || cb.disabled)
                    .map(cb => cb.value);
                
                if (this.saveSettings(newEnabled)) {
                    this.close();
                }
            });
        } else {
            const providerSelect = content.querySelector('#modal-provider-select');
            const apiKeyInput = content.querySelector('#modal-api-key');
            
            const loadKey = () => {
                const keyName = providerSelect.value;
                apiKeyInput.value = localStorage.getItem(keyName) || '';
            };

            if (this.requestedProviderKey) {
                providerSelect.value = this.requestedProviderKey;
                this.requestedProviderKey = null;
            }
            loadKey();

            providerSelect.addEventListener('change', loadKey);
            
            content.querySelector('#modal-btn-cancel').addEventListener('click', () => this.close());
            content.querySelector('#modal-btn-save').addEventListener('click', () => {
                const keyName = providerSelect.value;
                const keyValue = apiKeyInput.value.trim();
                if (keyValue) {
                    localStorage.setItem(keyName, keyValue);
                } else {
                    localStorage.removeItem(keyName);
                }
                this.close(keyValue);
            });
        }
    }

    renderProvidersTab() {
        const enabled = this.getEnabledProviders();
        return `
            <p class="modal-desc">Enable or disable question sources.</p>
            <div class="provider-list">
                ${this.providersConfig.map(p => `
                    <div class="provider-card">
                        <div class="provider-emoji">${p.emoji}</div>
                        <div class="provider-card-info">
                            <strong>${p.name}</strong>
                            <span>${p.desc}</span>
                        </div>
                        <label class="toggle-switch ${p.disabled ? 'disabled' : ''}" title="${p.disabled ? 'Always available' : ''}">
                            <input type="checkbox" value="${p.id}" ${enabled.includes(p.id) || p.disabled ? 'checked' : ''} ${p.disabled ? 'disabled' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                `).join('')}
            </div>
            <div class="modal-actions settings-dialog-actions" style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: flex-end;">
                <button id="btn-settings-cancel" class="btn-answer">Cancel</button>
                <button id="btn-settings-save" class="btn-answer" style="background: var(--accent-highlight); color: #fff; border-color: var(--accent-highlight);">Save & Apply</button>
            </div>
        `;
    }

    renderApiKeysTab() {
        return `
            <p class="modal-desc">Manage your free-tier API keys for external providers.</p>
            
            <div class="form-group">
                <label for="modal-provider-select" class="settings-label">Select Provider</label>
                <div class="select-wrap" style="margin-top: 0.25rem;">
                    <select id="modal-provider-select" class="settings-select" style="width: 100%;">
                        <option value="quizapi_key">QuizAPI.io (Tech)</option>
                        <option value="apininjas_key">API Ninjas</option>
                    </select>
                </div>
            </div>

            <div class="form-group" style="margin-top: 1rem;">
                <label for="modal-api-key" class="settings-label">API Key</label>
                <input type="text" id="modal-api-key" placeholder="Enter your key here..." class="modal-input" autocomplete="off" />
            </div>

            <div class="modal-actions" style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: flex-end;">
                <button id="modal-btn-cancel" class="btn-answer">Cancel</button>
                <button id="modal-btn-save" class="btn-answer" style="background: var(--accent-highlight); color: #fff; border-color: var(--accent-highlight);">Save Key</button>
            </div>
        `;
    }

    open(tab = 'providers') {
        this.currentTab = tab;
        this.renderDialog();
        this.dialog.showModal();
    }

    close(returnedKey = null) {
        this.dialog.close();
        if (this.resolvePromise) {
            this.resolvePromise(returnedKey);
            this.resolvePromise = null;
        }
    }

    /**
     * Promise-based API for providers to request a key.
     * @param {string} providerKey - 'quizapi_key' or 'apininjas_key'
     */
    requestKey(providerKey) {
        return new Promise((resolve) => {
            this.resolvePromise = resolve;
            this.requestedProviderKey = providerKey;
            this.open('apikeys');
        });
    }
}
