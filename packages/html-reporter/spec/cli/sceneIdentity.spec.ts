import { expect, test } from '@playwright/test';

import { findHistoricalMatch, sceneIdentity, sceneIdentityWithinRun, tagDiscriminator } from '../../src/cli/model/sceneIdentity.js';

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

test.describe('sceneIdentityWithinRun', () => {

    test('returns path:line when each scene has a unique source line', () => {
        const scenes = [
            { source: { path: 'spec/a.spec.ts', line: 10 }, name: 'test A', tags: [] },
            { source: { path: 'spec/a.spec.ts', line: 20 }, name: 'test B', tags: [] },
        ];
        const identity = sceneIdentityWithinRun(scenes);
        expect(identity(scenes[0])).toBe('spec/a.spec.ts:10');
        expect(identity(scenes[1])).toBe('spec/a.spec.ts:20');
    });

    test('appends name when multiple scenes share the same source line', () => {
        const scenes = [
            { source: { path: 'spec/a.spec.ts', line: 35 }, name: 'should have no violations at https://example.com', tags: [] },
            { source: { path: 'spec/a.spec.ts', line: 35 }, name: 'should have no violations at https://example.com/about', tags: [] },
        ];
        const identity = sceneIdentityWithinRun(scenes);
        expect(identity(scenes[0])).toBe('spec/a.spec.ts:35:should have no violations at https://example.com');
        expect(identity(scenes[1])).toBe('spec/a.spec.ts:35:should have no violations at https://example.com/about');
    });

    test('only disambiguates colliding scenes — non-colliding scenes keep path:line', () => {
        const scenes = [
            { source: { path: 'spec/a.spec.ts', line: 10 }, name: 'unique test', tags: [] },
            { source: { path: 'spec/a.spec.ts', line: 35 }, name: 'dynamic test 1', tags: [] },
            { source: { path: 'spec/a.spec.ts', line: 35 }, name: 'dynamic test 2', tags: [] },
        ];
        const identity = sceneIdentityWithinRun(scenes);
        expect(identity(scenes[0])).toBe('spec/a.spec.ts:10');
        expect(identity(scenes[1])).toBe('spec/a.spec.ts:35:dynamic test 1');
        expect(identity(scenes[2])).toBe('spec/a.spec.ts:35:dynamic test 2');
    });

    test('includes tag discriminator alongside name disambiguation', () => {
        const scenes = [
            { source: { path: 'spec/a.spec.ts', line: 35 }, name: 'test at url A', tags: [{ type: 'browser', name: 'chromium 149' }] },
            { source: { path: 'spec/a.spec.ts', line: 35 }, name: 'test at url B', tags: [{ type: 'browser', name: 'chromium 149' }] },
        ];
        const identity = sceneIdentityWithinRun(scenes);
        expect(identity(scenes[0])).toBe('spec/a.spec.ts:35:test at url A@chromium 149');
        expect(identity(scenes[1])).toBe('spec/a.spec.ts:35:test at url B@chromium 149');
    });

    test('detects collision per base identity including tag discriminator', () => {
        // Same path:line but different projects — these are already disambiguated by tags, no name needed
        const scenes = [
            { source: { path: 'spec/a.spec.ts', line: 35 }, name: 'checkout', tags: [{ type: 'project', name: 'desktop' }] },
            { source: { path: 'spec/a.spec.ts', line: 35 }, name: 'checkout', tags: [{ type: 'project', name: 'mobile' }] },
        ];
        const identity = sceneIdentityWithinRun(scenes);
        expect(identity(scenes[0])).toBe('spec/a.spec.ts:35@desktop');
        expect(identity(scenes[1])).toBe('spec/a.spec.ts:35@mobile');
    });

    test('detects collision when same path:line AND same tags produce duplicate base identities', () => {
        // Same path:line AND same tags — need name to disambiguate
        const scenes = [
            { source: { path: 'spec/a.spec.ts', line: 35 }, name: 'test url A', tags: [{ type: 'project', name: 'desktop' }] },
            { source: { path: 'spec/a.spec.ts', line: 35 }, name: 'test url B', tags: [{ type: 'project', name: 'desktop' }] },
        ];
        const identity = sceneIdentityWithinRun(scenes);
        expect(identity(scenes[0])).toBe('spec/a.spec.ts:35:test url A@desktop');
        expect(identity(scenes[1])).toBe('spec/a.spec.ts:35:test url B@desktop');
    });

    test('falls back to path:name when line is 0', () => {
        const scenes = [
            { source: { path: 'spec/a.spec.ts', line: 0 }, name: 'manual test A', tags: [] },
            { source: { path: 'spec/a.spec.ts', line: 0 }, name: 'manual test B', tags: [] },
        ];
        const identity = sceneIdentityWithinRun(scenes);
        // line 0 is falsy, so base is path:name — already unique by name
        expect(identity(scenes[0])).toBe('spec/a.spec.ts:manual test A');
        expect(identity(scenes[1])).toBe('spec/a.spec.ts:manual test B');
    });

    test('returns the same identity when called multiple times for the same scene', () => {
        const scenes = [
            { source: { path: 'spec/a.spec.ts', line: 35 }, name: 'test 1', tags: [] },
            { source: { path: 'spec/a.spec.ts', line: 35 }, name: 'test 2', tags: [] },
        ];
        const identity = sceneIdentityWithinRun(scenes);
        const first = identity(scenes[0]);
        const second = identity(scenes[0]);
        expect(first).toBe(second);
    });
});

test.describe('findHistoricalMatch', () => {

    const scene = (overrides: Partial<{ name: string; path: string; line: number; tags: Array<{ type: string; name: string }> }> = {}) => ({
        name: overrides.name ?? 'should complete checkout',
        source: { path: overrides.path ?? 'spec/checkout.spec.ts', line: overrides.line ?? 10 },
        tags: overrides.tags ?? [],
    });

    test('returns undefined when no candidates are provided', () => {
        const result = findHistoricalMatch(scene(), []);
        expect(result).toBeUndefined();
    });

    test('matches exactly when all three fields agree (3/3)', () => {
        const current = scene();
        const candidate = scene();
        expect(findHistoricalMatch(current, [candidate])).toBe(candidate);
    });

    test('matches a renamed test (same path + same line, different name — 2/3)', () => {
        const current = scene({ name: 'should complete checkout v2' });
        const candidate = scene({ name: 'should complete checkout' });
        expect(findHistoricalMatch(current, [candidate])).toBe(candidate);
    });

    test('matches a moved test (same path + same name, different line — 2/3)', () => {
        const current = scene({ line: 25 });
        const candidate = scene({ line: 10 });
        expect(findHistoricalMatch(current, [candidate])).toBe(candidate);
    });

    test('does not match when only path agrees (1/3)', () => {
        const current = scene({ name: 'completely different test', line: 99 });
        const candidate = scene();
        expect(findHistoricalMatch(current, [candidate])).toBeUndefined();
    });

    test('does not match when only name agrees (1/3)', () => {
        const current = scene({ path: 'spec/other.spec.ts', line: 99 });
        const candidate = scene();
        expect(findHistoricalMatch(current, [candidate])).toBeUndefined();
    });

    test('does not match when only line agrees (1/3)', () => {
        const current = scene({ path: 'spec/other.spec.ts', name: 'unrelated test' });
        const candidate = scene();
        expect(findHistoricalMatch(current, [candidate])).toBeUndefined();
    });

    test('does not match when no fields agree (0/3)', () => {
        const current = scene({ path: 'spec/other.spec.ts', name: 'unrelated', line: 99 });
        const candidate = scene();
        expect(findHistoricalMatch(current, [candidate])).toBeUndefined();
    });

    test.describe('tiebreaking', () => {

        test('prefers a 3/3 match over a 2/3 match', () => {
            const current = scene({ name: 'checkout', line: 10 });
            const exact = scene({ name: 'checkout', line: 10 });
            const partial = scene({ name: 'checkout', line: 20 }); // path+name only

            expect(findHistoricalMatch(current, [partial, exact])).toBe(exact);
        });

        test('prefers path+name over path+line when both score 2/3', () => {
            const current = scene({ name: 'checkout', line: 15 });
            const pathAndName = scene({ name: 'checkout', line: 20 }); // path+name
            const pathAndLine = scene({ name: 'other test', line: 15 }); // path+line

            expect(findHistoricalMatch(current, [pathAndLine, pathAndName])).toBe(pathAndName);
        });

        test('prefers path+line over line+name when both score 2/3', () => {
            const current = scene({ path: 'spec/checkout.spec.ts', name: 'checkout', line: 10 });
            const pathAndLine = scene({ path: 'spec/checkout.spec.ts', name: 'renamed', line: 10 }); // path+line
            const lineAndName = scene({ path: 'spec/other.spec.ts', name: 'checkout', line: 10 }); // line+name

            expect(findHistoricalMatch(current, [lineAndName, pathAndLine])).toBe(pathAndLine);
        });

        test('prefers path+name over line+name when both score 2/3', () => {
            const current = scene({ path: 'spec/checkout.spec.ts', name: 'checkout', line: 15 });
            const pathAndName = scene({ path: 'spec/checkout.spec.ts', name: 'checkout', line: 20 }); // path+name
            const lineAndName = scene({ path: 'spec/other.spec.ts', name: 'checkout', line: 15 }); // line+name

            expect(findHistoricalMatch(current, [lineAndName, pathAndName])).toBe(pathAndName);
        });
    });

    test.describe('tag discriminator gate', () => {

        test('does not match when tag discriminators differ', () => {
            const current = scene({ tags: [{ type: 'project', name: 'desktop' }] });
            const candidate = scene({ tags: [{ type: 'project', name: 'mobile' }] });

            expect(findHistoricalMatch(current, [candidate])).toBeUndefined();
        });

        test('matches when tag discriminators are identical', () => {
            const current = scene({ tags: [{ type: 'project', name: 'desktop' }] });
            const candidate = scene({ tags: [{ type: 'project', name: 'desktop' }] });

            expect(findHistoricalMatch(current, [candidate])).toBe(candidate);
        });

        test('skips candidates with wrong discriminator even if all three fields match', () => {
            const current = scene({ tags: [{ type: 'module', name: 'playwright-web' }] });
            const wrongModule = scene({ tags: [{ type: 'module', name: 'webdriverio-web' }] });
            const rightModule = scene({ name: 'should complete checkout v2', tags: [{ type: 'module', name: 'playwright-web' }] }); // only 2/3

            expect(findHistoricalMatch(current, [wrongModule, rightModule])).toBe(rightModule);
        });
    });

    test.describe('multiple candidates', () => {

        test('selects the best match among several candidates', () => {
            const current = scene({ name: 'checkout', line: 10 });
            const noMatch = scene({ name: 'unrelated', line: 99 }); // path only = 1/3
            const partial = scene({ name: 'checkout', line: 20 }); // path+name = 2/3
            const exact = scene({ name: 'checkout', line: 10 }); // 3/3

            expect(findHistoricalMatch(current, [noMatch, partial, exact])).toBe(exact);
        });

        test('returns first best match when multiple candidates tie at the same score and tiebreaker', () => {
            const current = scene({ name: 'checkout', line: 15 });
            const first = scene({ name: 'checkout', line: 20 }); // path+name
            const second = scene({ name: 'checkout', line: 30 }); // path+name (same tiebreaker)

            // Both score equally — first encountered wins
            expect(findHistoricalMatch(current, [first, second])).toBe(first);
        });
    });
});
