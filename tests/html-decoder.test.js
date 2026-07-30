import assert from 'assert';
import { decodeHtmlEntities } from '../js/utils/html-decoder.js';

export function runTests() {
    console.log('Running html-decoder tests...');
    
    assert.strictEqual(decodeHtmlEntities('Hello &amp; World'), 'Hello & World');
    assert.strictEqual(decodeHtmlEntities('&quot;Quote&quot;'), '"Quote"');
    assert.strictEqual(decodeHtmlEntities('&#039;Single&#039;'), "'Single'");
    assert.strictEqual(decodeHtmlEntities('&lt;b&gt;bold&lt;/b&gt;'), '<b>bold</b>');
    
    console.log('✅ html-decoder tests passed\n');
}
