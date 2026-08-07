import { expect, test } from '@playwright/test';

import { sceneIdentity, tagDiscriminator } from '../../src/cli/model/sceneIdentity.js';

test.describe('tagDiscriminator', () => {

    test('returns empty string when no discriminator tags are present', () => {
        expect(tagDiscriminator([{ type: 'feature', name: 'Login' }]))
            .toBe('');
    });

    test('includes module tag', () => {
        expect(tagDiscriminator([{ type: 'module', name: 'webdriverio-8-web-devtools' }]))
            .toBe('webdriverio-8-web-devtools');
    });

    test('includes browser tag', () => {
        expect(tagDiscriminator([{ type: 'browser', name: 'chromium 149' }]))
            .toBe('chromium 149');
    });

    test('includes project tag', () => {
        expect(tagDiscriminator([{ type: 'project', name: 'mobile' }]))
            .toBe('mobile');
    });

    test('includes platform tag', () => {
        expect(tagDiscriminator([{ type: 'platform', name: 'darwin 24.5.0' }]))
            .toBe('darwin 24.5.0');
    });

    test('joins all four discriminator tags with @', () => {
        expect(tagDiscriminator([
            { type: 'module', name: 'playwright-web' },
            { type: 'browser', name: 'chromium 149' },
            { type: 'project', name: 'mobile' },
            { type: 'platform', name: 'darwin 24.5.0' },
        ])).toBe('playwright-web@chromium 149@mobile@darwin 24.5.0');
    });

    test('skips absent discriminator tags without extra separators', () => {
        expect(tagDiscriminator([
            { type: 'browser', name: 'firefox 115' },
            { type: 'platform', name: 'linux' },
        ])).toBe('firefox 115@linux');
    });
});

test.describe('sceneIdentity', () => {

    test('uses source path and line when line is available', () => {
        expect(sceneIdentity({
            source: { path: 'spec/a.spec.ts', line: 10 },
            name: 'test',
            tags: [],
        })).toBe('spec/a.spec.ts:10');
    });

    test('uses source path and name when line is not available', () => {
        expect(sceneIdentity({
            source: { path: 'spec/a.spec.ts', line: 0 },
            name: 'my test',
            tags: [],
        })).toBe('spec/a.spec.ts:my test');
    });

    test('returns base identity when no discriminator tags exist', () => {
        expect(sceneIdentity({
            source: { path: 'spec/a.spec.ts', line: 10 },
            name: 'test',
            tags: [{ type: 'feature', name: 'Login' }],
        })).toBe('spec/a.spec.ts:10');
    });

    test('appends all discriminator tags to disambiguate cross-project runs', () => {
        expect(sceneIdentity({
            source: { path: 'spec/checkout.spec.ts', line: 10 },
            name: 'should complete checkout',
            tags: [
                { type: 'browser', name: 'chromium 149' },
                { type: 'project', name: 'mobile' },
                { type: 'platform', name: 'darwin 24.5.0' },
            ],
        })).toBe('spec/checkout.spec.ts:10@chromium 149@mobile@darwin 24.5.0');
    });

    test('produces different identities for same scenario in different modules', () => {
        const devtools = sceneIdentity({
            source: { path: 'spec/protocol.spec.ts', line: 10 },
            name: 'correctly sets the isDevTools flag',
            tags: [{ type: 'module', name: 'webdriverio-8-web-devtools' }],
        });

        const webdriver = sceneIdentity({
            source: { path: 'spec/protocol.spec.ts', line: 10 },
            name: 'correctly sets the isDevTools flag',
            tags: [{ type: 'module', name: 'webdriverio-8-web-webdriverio' }],
        });

        expect(devtools).not.toBe(webdriver);
        expect(devtools).toBe('spec/protocol.spec.ts:10@webdriverio-8-web-devtools');
        expect(webdriver).toBe('spec/protocol.spec.ts:10@webdriverio-8-web-webdriverio');
    });

    test('produces different identities for same scenario in different projects', () => {
        const desktop = sceneIdentity({
            source: { path: 'spec/checkout.spec.ts', line: 10 },
            name: 'should complete checkout',
            tags: [
                { type: 'browser', name: 'chromium 149' },
                { type: 'project', name: 'desktop' },
            ],
        });

        const mobile = sceneIdentity({
            source: { path: 'spec/checkout.spec.ts', line: 10 },
            name: 'should complete checkout',
            tags: [
                { type: 'browser', name: 'chromium 149' },
                { type: 'project', name: 'mobile' },
            ],
        });

        expect(desktop).not.toBe(mobile);
    });
});
