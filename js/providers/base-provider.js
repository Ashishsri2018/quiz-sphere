/**
 * @typedef {Object} NormalizedQuestion
 * @property {string} question - Decoded question text
 * @property {'multiple'|'boolean'} type - Question type
 * @property {string} correctAnswer - The correct answer
 * @property {string[]} allAnswers - Shuffled array of all options
 * @property {string} difficulty - easy|medium|hard
 * @property {string} category - Question category
 * @property {string} provider - Source provider name
 */

export class BaseProvider {
    /**
     * @returns {string} Provider name
     */
    get name() {
        return 'Unknown';
    }

    /**
     * Fetches a batch of questions from the API
     * @param {string} difficulty - 'easy', 'medium', or 'hard'
     * @param {number} amount - Number of questions to fetch
     * @returns {Promise<NormalizedQuestion[]>}
     */
    async fetchQuestions(difficulty, amount) {
        throw new Error('Not implemented');
    }

    /**
     * Checks if this provider is available (e.g., API key exists, no rate limit)
     * @returns {boolean}
     */
    isAvailable() {
        return true;
    }
}
