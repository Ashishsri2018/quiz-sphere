import { OpenTDBProvider } from '../providers/opentdb-provider.js';
import { TriviaAPIProvider } from '../providers/trivia-api-provider.js';
import { FallbackProvider } from '../providers/fallback-provider.js';
import { CONFIG } from '../utils/constants.js';

export class ProviderManager {
    constructor() {
        this.providers = [
            new OpenTDBProvider(),
            new TriviaAPIProvider()
        ];
        this.fallbackProvider = new FallbackProvider();
        this.currentIndex = 0;
        this.cooldowns = new Map(); // provider name -> expiry timestamp
    }

    /**
     * Gets the next batch of questions, rotating through providers
     */
    async getNextBatch(difficulty, amount) {
        let attempts = 0;
        const maxAttempts = this.providers.length;

        while (attempts < maxAttempts) {
            const provider = this.providers[this.currentIndex];
            this.currentIndex = (this.currentIndex + 1) % this.providers.length;

            if (this.isProviderOnCooldown(provider.name)) {
                attempts++;
                continue;
            }

            try {
                const questions = await provider.fetchQuestions(difficulty, amount);
                if (questions && questions.length > 0) {
                    return questions;
                }
                this.setProviderCooldown(provider.name);
            } catch (error) {
                console.warn(`Provider ${provider.name} failed:`, error);
                this.setProviderCooldown(provider.name);
            }
            attempts++;
        }

        console.warn('All primary API providers failed, using local fallback.');
        return await this.fallbackProvider.fetchQuestions(difficulty, amount);
    }

    isProviderOnCooldown(name) {
        const expiry = this.cooldowns.get(name);
        if (!expiry) return false;
        
        if (Date.now() > expiry) {
            this.cooldowns.delete(name);
            return false;
        }
        return true;
    }

    setProviderCooldown(name) {
        this.cooldowns.set(name, Date.now() + CONFIG.PROVIDER_COOLDOWN_MS);
    }
}
