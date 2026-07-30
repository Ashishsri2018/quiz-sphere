import { runTests as testHtmlDecoder } from './html-decoder.test.js';
import { runTests as testProviderManager } from './provider-manager.test.js';
import { runTests as testQuestionBuffer } from './question-buffer.test.js';
import { runTests as testQuizEngine } from './quiz-engine.test.js';
import { runTests as testSettingsManager } from './settings-manager.test.js';

async function runAll() {
    console.log('--- Starting Test Suite ---\n');
    
    try {
        testHtmlDecoder();
        await testProviderManager();
        await testQuestionBuffer();
        await testQuizEngine();
        await testSettingsManager();
        
        console.log('🎉 All tests passed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

runAll();
