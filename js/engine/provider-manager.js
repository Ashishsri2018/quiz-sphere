import { OpenTDBProvider } from '../providers/opentdb-provider.js';
import { TriviaAPIProvider } from '../providers/trivia-api-provider.js';
import { QuizAPIProvider } from '../providers/quizapi-provider.js';
import { ApiNinjasProvider } from '../providers/api-ninjas-provider.js';
import { FallbackProvider } from '../providers/fallback-provider.js';
import { CONFIG } from '../utils/constants.js';

export class ProviderManager {
    constructor() {
        this.providers = [
            new OpenTDBProvider(),
            new TriviaAPIProvider(),
            new QuizAPIProvider(),
            new ApiNinjasProvider()
        ];
        this.fallbackProvider = new FallbackProvider();
        this.currentIndex = 0;
        this.cooldowns = new Map(); // provider name -> expiry timestamp
    }

    /**
     * Gets all available provider names (for UI display)
     */
    getProviderNames() {
        return [
            ...this.providers.map(p => p.name),
            this.fallbackProvider.name
        ];
    }

    /**
     * Gets the next batch of questions.
     * @param {string} difficulty
     * @param {number} amount
     * @param {string} [targetProvider='all'] - 'all' for rotation, or a provider name
     */
    async getNextBatch(difficulty, amount, targetProvider = 'all') {
        if (targetProvider !== 'all') {
            return this.fetchFromSpecificProvider(difficulty, amount, targetProvider);
        }

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

    /**
     * Fetch from a single named provider, falling back to FallbackProvider on error
     */
    async fetchFromSpecificProvider(difficulty, amount, providerName) {
        // Check the primary providers list first
        const provider = this.providers.find(p => p.name === providerName);
        if (provider) {
            if (this.isProviderOnCooldown(provider.name)) {
                console.warn(`Provider ${provider.name} is on cooldown, using fallback.`);
                return this.fallbackProvider.fetchQuestions(difficulty, amount);
            }
            try {
                const questions = await provider.fetchQuestions(difficulty, amount);
                if (questions && questions.length > 0) return questions;
                this.setProviderCooldown(provider.name);
            } catch (error) {
                console.warn(`Provider ${provider.name} failed:`, error);
                this.setProviderCooldown(provider.name);
            }
            return this.fallbackProvider.fetchQuestions(difficulty, amount);
        }

        // If asking for fallback directly
        if (providerName === this.fallbackProvider.name) {
            return this.fallbackProvider.fetchQuestions(difficulty, amount);
        }

        // Unknown provider, fallback
        console.warn(`Unknown provider "${providerName}", using fallback.`);
        return this.fallbackProvider.fetchQuestions(difficulty, amount);
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
