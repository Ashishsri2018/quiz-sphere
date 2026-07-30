import assert from 'assert';
import { SettingsModal } from '../js/ui/settings-modal.js';
import { PROVIDERS, DEFAULT_ENABLED_PROVIDERS } from '../js/utils/constants.js';

export async function runTests() {
    console.log('Running settings-modal tests...');

    // Mock localStorage and DOM
    let store = {};
    global.localStorage = {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; }
    };

    let alertCalled = false;
    global.alert = (msg) => { alertCalled = true; };

    global.document = {
        getElementById: (id) => {
            return {
                id,
                innerHTML: '',
                classList: { add: () => {}, remove: () => {} },
                showModal: () => {},
                close: () => {},
                addEventListener: function(evt, cb) {},
                appendChild: function(child) {
                    if (!this.children) this.children = [];
                    this.children.push(child);
                },
                querySelector: () => ({ addEventListener: () => {} })
            };
        },
        createElement: (tag) => {
            return {
                tagName: tag,
                className: '',
                style: {},
                classList: { add: () => {}, remove: () => {}, toggle: () => {} },
                setAttribute: function() {},
                addEventListener: function(evt, cb) {
                    if (!this.listeners) this.listeners = {};
                    this.listeners[evt] = cb;
                },
                appendChild: function(child) {
                    if (!this.children) this.children = [];
                    this.children.push(child);
                },
                querySelector: () => ({ checked: true })
            };
        }
    };

    // Test initialization (default to all)
    let settings = new SettingsModal('dummy-dialog');
    let enabled = settings.getEnabledProviders();
    assert.strictEqual(enabled.length, DEFAULT_ENABLED_PROVIDERS.length);
    assert.ok(enabled.includes(PROVIDERS.OPENTDB));
    
    // Test toggle logic via modifying enabled array and saving
    let newEnabled = [PROVIDERS.TRIVIA_API, PROVIDERS.FALLBACK];
    settings.saveSettings(newEnabled);
    
    let loaded = settings.loadSettings();
    assert.strictEqual(loaded.length, 2);
    assert.ok(loaded.includes(PROVIDERS.TRIVIA_API));
    assert.ok(!loaded.includes(PROVIDERS.OPENTDB));

    // Test fallback is always returned even if omitted
    settings.saveSettings([PROVIDERS.TRIVIA_API]);
    loaded = settings.loadSettings();
    assert.ok(loaded.includes(PROVIDERS.FALLBACK));

    console.log('✅ settings-modal tests passed\n');
}
