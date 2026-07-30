import { BaseProvider } from './base-provider.js';
import { shuffle } from '../utils/shuffler.js';

const FALLBACK_POOL = {
    easy: [
        { q: "What is the capital of France?", a: "Paris", w: ["London", "Berlin", "Madrid"] },
        { q: "What is 2 + 2?", a: "4", w: ["3", "5", "22"] },
        { q: "Which planet is known as the Red Planet?", a: "Mars", w: ["Venus", "Jupiter", "Saturn"] },
        { q: "What animal is the symbol of the World Wildlife Fund?", a: "Giant Panda", w: ["Tiger", "Bald Eagle", "Polar Bear"] },
        { q: "Who wrote 'Romeo and Juliet'?", a: "William Shakespeare", w: ["Charles Dickens", "Jane Austen", "Mark Twain"] }
    ],
    medium: [
        { q: "In what year did the Titanic sink?", a: "1912", w: ["1905", "1923", "1898"] },
        { q: "What is the chemical symbol for Gold?", a: "Au", w: ["Ag", "Go", "Gd"] },
        { q: "Who painted the Mona Lisa?", a: "Leonardo da Vinci", w: ["Vincent van Gogh", "Pablo Picasso", "Michelangelo"] },
        { q: "Which element is the most abundant in the Earth's atmosphere?", a: "Nitrogen", w: ["Oxygen", "Carbon Dioxide", "Hydrogen"] },
        { q: "What is the longest river in the world?", a: "Nile", w: ["Amazon", "Yangtze", "Mississippi"] }
    ],
    hard: [
        { q: "What is the rarest blood type?", a: "AB-Negative", w: ["O-Negative", "B-Negative", "A-Positive"] },
        { q: "Who discovered penicillin?", a: "Alexander Fleming", w: ["Marie Curie", "Louis Pasteur", "Gregor Mendel"] },
        { q: "In which year did the Soviet Union collapse?", a: "1991", w: ["1989", "1993", "1987"] },
        { q: "What is the capital city of Australia?", a: "Canberra", w: ["Sydney", "Melbourne", "Brisbane"] },
        { q: "Which programming language was created by Bjarne Stroustrup?", a: "C++", w: ["Java", "Python", "Ruby"] }
    ]
};

export class FallbackProvider extends BaseProvider {
    get name() {
        return 'Local Fallback';
    }

    async fetchQuestions(difficulty, amount) {
        const pool = FALLBACK_POOL[difficulty] || FALLBACK_POOL.easy;
        // Shuffle the pool and take 'amount' items
        const selected = shuffle([...pool]).slice(0, amount);
        
        return selected.map(item => {
            const allAnswers = shuffle([item.a, ...item.w]);
            return {
                question: item.q,
                type: 'multiple',
                correctAnswer: item.a,
                allAnswers: allAnswers,
                difficulty: difficulty,
                category: 'General Knowledge',
                provider: this.name
            };
        });
    }
}
