import assert from 'assert';
import { ProviderManager } from '../js/engine/provider-manager.js';

export async function runTests() {
    console.log('Running provider-manager tests...');
    
    const manager = new ProviderManager();
    
    // Mock the providers to avoid real API calls during tests
    manager.providers = [
        { name: 'Mock1', fetchQuestions: async () => [{ q: 1 }] },
        { name: 'Mock2', fetchQuestions: async () => { throw new Error('fail'); } }
    ];
    manager.fallbackProvider = { name: 'Fallback', fetchQuestions: async () => [{ q: 'fallback' }] };

    // 1. Should use Mock1 successfully
    const res1 = await manager.getNextBatch('easy', 1);
    assert.deepStrictEqual(res1, [{ q: 1 }]);
    
    // 2. Mock2 will fail, so it should catch error, put Mock2 on cooldown, and loop back to Mock1
    const res2 = await manager.getNextBatch('easy', 1);
    assert.deepStrictEqual(res2, [{ q: 1 }]);
    assert.strictEqual(manager.isProviderOnCooldown('Mock2'), true);

    // 3. Now Mock2 is on cooldown, so it should skip Mock2 and use Mock1 again
    const res3 = await manager.getNextBatch('easy', 1);
    assert.deepStrictEqual(res3, [{ q: 1 }]);

    console.log('✅ provider-manager tests passed\n');
}
