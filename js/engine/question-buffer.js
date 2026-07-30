import { ProviderManager } from './provider-manager.js';
import { CONFIG } from '../utils/constants.js';

export class QuestionBuffer {
    constructor() {
        this.queue = [];
        this.providerManager = new ProviderManager();
        this.isFetching = false;
        this.currentDifficulty = 'easy';
        this.currentProvider = 'all';
    }

    /**
     * Update difficulty and/or provider, flushing the buffer
     */
    async changeSettings(difficulty, provider) {
        this.currentDifficulty = difficulty;
        this.currentProvider = provider;
        this.queue = [];
        await this.ensureBuffer();
    }

    /**
     * Get the next question from the buffer
     * @returns {NormalizedQuestion|null}
     */
    getNext() {
        const question = this.queue.shift() || null;
        
        // Trigger prefetch if running low
        if (this.queue.length <= CONFIG.BUFFER_MIN_THRESHOLD) {
            this.ensureBuffer();
        }
        
        return question;
    }

    /**
     * Background task to keep the buffer full
     */
    async ensureBuffer() {
        if (this.isFetching) return;
        
        this.isFetching = true;
        try {
            let emptyBatches = 0;
            while (this.queue.length < CONFIG.FETCH_BATCH_SIZE) {
                const batch = await this.providerManager.getNextBatch(
                    this.currentDifficulty,
                    CONFIG.FETCH_BATCH_SIZE,
                    this.currentProvider
                );
                // In case difficulty changed while fetching, only add if it matches
                if (batch && batch.length > 0 && batch[0].difficulty === this.currentDifficulty) {
                    this.queue.push(...batch);
                    emptyBatches = 0;
                } else if (batch && batch.length > 0 && batch[0].difficulty !== this.currentDifficulty) {
                    break; // Difficulty changed, abort this fill loop
                } else {
                    emptyBatches++;
                    if (emptyBatches >= 3) break; // prevent infinite loop
                }
            }
        } catch (error) {
            console.error('Error filling buffer:', error);
        } finally {
            this.isFetching = false;
        }
    }
}
