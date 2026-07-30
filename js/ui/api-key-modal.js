/**
 * Manages the API Key Modal
 */
export class ApiKeyModal {
    constructor() {
        this.modal = document.getElementById('api-key-modal');
        this.btnOpen = document.getElementById('btn-open-settings');
        this.btnCancel = document.getElementById('modal-btn-cancel');
        this.btnSave = document.getElementById('modal-btn-save');
        this.providerSelect = document.getElementById('modal-provider-select');
        this.apiKeyInput = document.getElementById('modal-api-key');

        this.resolvePromise = null;
        this.bindEvents();
    }

    bindEvents() {
        // Open modal
        this.btnOpen.addEventListener('click', () => {
            this.open();
        });

        // Close/Cancel modal
        this.btnCancel.addEventListener('click', () => {
            this.close();
        });

        // Provider change: load key
        this.providerSelect.addEventListener('change', () => {
            this.loadKeyForSelectedProvider();
        });

        // Save key
        this.btnSave.addEventListener('click', () => {
            const keyName = this.providerSelect.value;
            const keyValue = this.apiKeyInput.value.trim();
            if (keyValue) {
                localStorage.setItem(keyName, keyValue);
            } else {
                localStorage.removeItem(keyName);
            }
            this.close(keyValue);
        });
        
        // Close on backdrop click
        this.modal.addEventListener('click', (e) => {
            const rect = this.modal.getBoundingClientRect();
            const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height
              && rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
            if (!isInDialog) {
                this.close();
            }
        });
    }

    loadKeyForSelectedProvider() {
        const keyName = this.providerSelect.value;
        const existingKey = localStorage.getItem(keyName) || '';
        this.apiKeyInput.value = existingKey;
    }

    open(providerKey = null) {
        if (providerKey) {
            this.providerSelect.value = providerKey;
        }
        this.loadKeyForSelectedProvider();
        this.modal.showModal();
    }

    close(returnedKey = null) {
        this.modal.close();
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
            this.open(providerKey);
        });
    }
}
