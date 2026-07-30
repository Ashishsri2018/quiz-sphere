import assert from 'assert';
import { SettingsManager } from '../js/ui/settings-manager.js';
import { DIFFICULTIES, PROVIDERS } from '../js/utils/constants.js';

export async function runTests() {
    console.log('Running settings-manager tests...');
    
    // Mock the DOM
    global.document = {
        getElementById: (id) => {
            if (id === 'settings-bar') {
                return {
                    innerHTML: '',
                    appendChild: function(child) {
                        if (!this.children) this.children = [];
                        this.children.push(child);
                    }
                };
            }
            return null;
        },
        createElement: (tag) => {
            return {
                tagName: tag,
                className: '',
                setAttribute: function() {},
                addEventListener: function(evt, cb) {
                    if (!this.listeners) this.listeners = {};
                    this.listeners[evt] = cb;
                },
                appendChild: function(child) {
                    if (!this.children) this.children = [];
                    this.children.push(child);
                }
            };
        }
    };
    
    let emittedDifficulty = null;
    let emittedProvider = null;
    
    const settings = new SettingsManager('settings-bar', (diff, prov) => {
        emittedDifficulty = diff;
        emittedProvider = prov;
    });
    
    assert.strictEqual(settings.currentDifficulty, 'easy');
    assert.strictEqual(settings.currentProvider, 'all');
    
    // Test setEnabledProviders filtering
    settings.setEnabledProviders([PROVIDERS.OPENTDB, PROVIDERS.FALLBACK]);
    let options = settings.getProviderOptions();
    assert.strictEqual(options.length, 3); // 'all', OPENTDB, FALLBACK
    assert.ok(options.find(o => o.value === PROVIDERS.ALL));
    assert.ok(options.find(o => o.value === PROVIDERS.OPENTDB));
    
    settings.setEnabledProviders([PROVIDERS.FALLBACK]);
    options = settings.getProviderOptions();
    assert.strictEqual(options.length, 1); // Only FALLBACK, no 'all' since length < 2
    assert.ok(!options.find(o => o.value === PROVIDERS.ALL));
    
    // Test render
    settings.render(DIFFICULTIES.MEDIUM, PROVIDERS.OPENTDB);
    assert.strictEqual(settings.currentDifficulty, 'medium');
    assert.strictEqual(settings.currentProvider, 'OpenTDB');
    
    // We can't fully test the DOM events in a simple mock, but we can test emitChange
    settings.currentDifficulty = 'hard';
    settings.emitChange();
    assert.strictEqual(emittedDifficulty, 'hard');
    assert.strictEqual(emittedProvider, 'OpenTDB');
    
    console.log('✅ settings-manager tests passed\n');
}
