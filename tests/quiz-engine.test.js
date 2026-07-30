import assert from 'assert';
import { QuizEngine } from '../js/engine/quiz-engine.js';
import { DIFFICULTIES } from '../js/utils/constants.js';

export async function runTests() {
    console.log('Running quiz-engine tests...');
    
    const engine = new QuizEngine();
    
    // Mock the buffer inside the engine
    let fetched = false;
    engine.buffer = {
        changeDifficulty: async () => { fetched = true; },
        getNext: () => {
            return {
                question: 'mock Q',
                correctAnswer: 'A',
                allAnswers: ['A', 'B', 'C', 'D'],
                type: 'multiple'
            };
        }
    };
    
    // Test initial state
    assert.strictEqual(engine.state, 'idle');
    
    // Test starting game
    engine.start(DIFFICULTIES.MEDIUM);
    assert.strictEqual(engine.difficulty, 'medium');
    assert.strictEqual(engine.state, 'loading'); // Immediately goes to loading
    
    // In our mock, start() calls setDifficulty which calls changeDifficulty then nextQuestion
    // We can simulate nextQuestion manually since our mock changeDifficulty doesn't chain
    engine.nextQuestion();
    assert.strictEqual(engine.state, 'show_question');
    assert.strictEqual(engine.currentQuestion.question, 'mock Q');
    
    // Test answering correctly
    engine.answer(0); // Index 0 is 'A' (correct)
    assert.strictEqual(engine.state, 'answered');
    assert.strictEqual(engine.score.correct, 1);
    assert.strictEqual(engine.score.streak, 1);
    assert.strictEqual(engine.score.bestStreak, 1);
    
    // Test answering wrongly
    engine.nextQuestion(); // simulate the auto-advance
    engine.answer(1); // Index 1 is 'B' (wrong)
    assert.strictEqual(engine.score.correct, 1);
    assert.strictEqual(engine.score.wrong, 1);
    assert.strictEqual(engine.score.streak, 0); // streak reset
    
    // Test answering in invalid state
    engine.setState('loading');
    engine.answer(0);
    assert.strictEqual(engine.state, 'loading'); // Should not change to answered
    
    // Test score reset on restart
    engine.start(DIFFICULTIES.HARD);
    assert.strictEqual(engine.score.correct, 0);
    assert.strictEqual(engine.score.wrong, 0);
    assert.strictEqual(engine.questionNumber, 0);
    assert.strictEqual(engine.difficulty, 'hard');
    
    console.log('✅ quiz-engine tests passed\n');
}
