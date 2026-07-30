import assert from 'assert';
import { QuestionBuffer } from '../js/engine/question-buffer.js';

export async function runTests() {
    console.log('Running question-buffer tests...');
    
    const buffer = new QuestionBuffer();
    
    // Mock ProviderManager inside buffer
    let callCount = 0;
    buffer.providerManager.getNextBatch = async (difficulty, amount) => {
        callCount++;
        return Array(amount).fill({ difficulty, q: 'mock' });
    };

    await buffer.ensureBuffer();
    
    assert.strictEqual(buffer.queue.length, 5); // Default FETCH_BATCH_SIZE
    assert.strictEqual(buffer.currentDifficulty, 'easy');
    
    // Test getting next question and prefetching
    const q1 = buffer.getNext();
    assert.strictEqual(q1.q, 'mock');
    assert.strictEqual(buffer.queue.length, 4);
    
    // Test difficulty change (should flush and refill)
    await buffer.changeDifficulty('hard');
    assert.strictEqual(buffer.currentDifficulty, 'hard');
    assert.strictEqual(buffer.queue.length, 5); // Filled with new difficulty
    assert.strictEqual(buffer.queue[0].difficulty, 'hard');

    console.log('✅ question-buffer tests passed\n');
}
