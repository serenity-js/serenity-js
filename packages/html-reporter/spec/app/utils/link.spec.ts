import { expect, test } from '@playwright/test';

import { capabilityLink, link, scenarioLink, testsLink } from '../../../app/utils/link.js';

test.describe('link() — type-safe URL builder', () => {

    test.describe('DashboardLink', () => {

        test('builds root path for dashboard', () => {
            const url = link({ view: 'dashboard' });
            expect(url).toBe('/');
        });
    });

    test.describe('TestsLink', () => {

        test('builds base path for tests view', () => {
            const url = link({ view: 'tests' });
            expect(url).toBe('/tests');
        });

        test('builds scenario detail URL with path segment', () => {
            const url = link({ view: 'tests', path: 'auth.spec.ts:42' });
            expect(url).toBe('/tests/auth.spec.ts%3A42');
        });

        test('encodes colons in path segment', () => {
            const url = link({ view: 'tests', path: 'file.spec.ts:123' });
            expect(url).toContain('file.spec.ts%3A123');
        });

        test('encodes spaces in path segment', () => {
            const url = link({ view: 'tests', path: 'my spec file.ts:42' });
            expect(url).toContain('my%20spec%20file.ts%3A42');
        });

        test('encodes forward slashes in path segment', () => {
            const url = link({ view: 'tests', path: 'features/auth/login.spec.ts:42' });
            expect(url).toContain('features%2Fauth%2Flogin.spec.ts%3A42');
        });

        test('encodes special characters in path segment', () => {
            const url = link({ view: 'tests', path: 'test@file:42' });
            expect(url).toContain('test%40file%3A42');
        });

        test('adds run query parameter', () => {
            const url = link({ view: 'tests', run: '8333' });
            expect(url).toBe('/tests?run=8333');
        });

        test('accepts numeric run ID', () => {
            const url = link({ view: 'tests', run: 42 });
            expect(url).toBe('/tests?run=42');
        });

        test('adds search query parameter', () => {
            const url = link({ view: 'tests', search: '@module:playwright-test' });
            expect(url).toBe('/tests?search=%40module%3Aplaywright-test');
        });

        test('encodes @ symbol in search', () => {
            const url = link({ view: 'tests', search: '@browser:chromium' });
            expect(url).toContain('%40browser%3Achromium');
        });

        test('encodes spaces in search', () => {
            const url = link({ view: 'tests', search: 'my test name' });
            expect(url).toContain('my%20test%20name');
        });

        test('adds filter query parameter', () => {
            const url = link({ view: 'tests', filter: 'failed' });
            expect(url).toBe('/tests?filter=failed');
        });

        test('omits filter when set to "all"', () => {
            const url = link({ view: 'tests', filter: 'all' });
            expect(url).toBe('/tests');
        });

        test('adds sort query parameter', () => {
            const url = link({ view: 'tests', sort: 'duration' });
            expect(url).toBe('/tests?sort=duration');
        });

        test('adds browser query parameter', () => {
            const url = link({ view: 'tests', browser: 'chromium' });
            expect(url).toBe('/tests?browser=chromium');
        });

        test('adds project query parameter', () => {
            const url = link({ view: 'tests', project: 'mobile' });
            expect(url).toBe('/tests?project=mobile');
        });

        test('adds platform query parameter', () => {
            const url = link({ view: 'tests', platform: 'darwin' });
            expect(url).toBe('/tests?platform=darwin');
        });

        test('combines path segment with query parameters', () => {
            const url = link({ view: 'tests', path: 'auth.spec.ts:42', run: '8333', browser: 'chromium' });
            expect(url).toBe('/tests/auth.spec.ts%3A42?run=8333&browser=chromium');
        });

        test('combines multiple query parameters', () => {
            const url = link({ view: 'tests', run: '42', search: '@module:playwright', filter: 'failed', sort: 'duration' });
            expect(url).toContain('run=42');
            expect(url).toContain('search=%40module%3Aplaywright');
            expect(url).toContain('filter=failed');
            expect(url).toContain('sort=duration');
        });

        test('handles undefined run parameter', () => {
            const url = link({ view: 'tests', run: undefined, search: 'test' });
            expect(url).toBe('/tests?search=test');
        });

        test('handles null run parameter', () => {
            const url = link({ view: 'tests', run: null as any, search: 'test' });
            expect(url).toBe('/tests?search=test');
        });

        test('handles empty search string', () => {
            const url = link({ view: 'tests', search: '' });
            expect(url).toBe('/tests');
        });
    });

    test.describe('CapabilitiesLink', () => {

        test('builds base path for capabilities view', () => {
            const url = link({ view: 'capabilities' });
            expect(url).toBe('/capabilities');
        });

        test('adds path as query parameter (not path segment)', () => {
            const url = link({ view: 'capabilities', path: 'authentication/login' });
            expect(url).toBe('/capabilities?path=authentication%2Flogin');
        });

        test('encodes slashes in path query parameter', () => {
            const url = link({ view: 'capabilities', path: 'auth/oauth/callback' });
            expect(url).toContain('auth%2Foauth%2Fcallback');
        });

        test('encodes spaces in path', () => {
            const url = link({ view: 'capabilities', path: 'feature with spaces' });
            expect(url).toContain('feature%20with%20spaces');
        });
    });

    test.describe('ErrorsLink', () => {

        test('builds base path for errors view', () => {
            const url = link({ view: 'errors' });
            expect(url).toBe('/errors');
        });

        test('adds run query parameter', () => {
            const url = link({ view: 'errors', run: '8333' });
            expect(url).toBe('/errors?run=8333');
        });

        test('adds search query parameter', () => {
            const url = link({ view: 'errors', search: 'timeout' });
            expect(url).toBe('/errors?search=timeout');
        });

        test('combines run and search', () => {
            const url = link({ view: 'errors', run: '42', search: 'network' });
            expect(url).toContain('run=42');
            expect(url).toContain('search=network');
        });
    });

    test.describe('ConsistencyLink', () => {

        test('builds path for consistency view', () => {
            const url = link({ view: 'consistency' });
            expect(url).toBe('/consistency');
        });
    });

    test.describe('TimelineLink', () => {

        test('builds path for timeline view', () => {
            const url = link({ view: 'timeline' });
            expect(url).toBe('/timeline');
        });
    });

    test.describe('TagsLink', () => {

        test('builds path for tags view', () => {
            const url = link({ view: 'tags' });
            expect(url).toBe('/tags');
        });
    });

    test.describe('TestRunsLink', () => {

        test('builds path for test-runs view', () => {
            const url = link({ view: 'test-runs' });
            expect(url).toBe('/test-runs');
        });
    });

    test.describe('SystemLink', () => {

        test('builds path for system view', () => {
            const url = link({ view: 'system' });
            expect(url).toBe('/system');
        });
    });

    test.describe('AboutLink', () => {

        test('builds path for about view', () => {
            const url = link({ view: 'about' });
            expect(url).toBe('/about');
        });
    });
});

test.describe('testsLink() — convenience function', () => {

    test('builds base tests URL with no parameters', () => {
        const url = testsLink();
        expect(url).toBe('/tests');
    });

    test('accepts all TestsLink parameters', () => {
        const url = testsLink({ run: '42', search: '@module:core', filter: 'failed' });
        expect(url).toContain('run=42');
        expect(url).toContain('search=%40module%3Acore');
        expect(url).toContain('filter=failed');
    });

    test('builds scenario detail URL with path', () => {
        const url = testsLink({ path: 'auth.spec.ts:42', run: '8333' });
        expect(url).toBe('/tests/auth.spec.ts%3A42?run=8333');
    });
});

test.describe('scenarioLink() — convenience function', () => {

    test('builds scenario URL from source with line number', () => {
        const url = scenarioLink({ path: 'auth.spec.ts', line: 42 });
        expect(url).toBe('/tests/auth.spec.ts%3A42');
    });

    test('builds scenario URL from source with name', () => {
        const url = scenarioLink({ path: 'auth.spec.ts', name: 'should login' });
        expect(url).toBe('/tests/auth.spec.ts%3Ashould%20login');
    });

    test('builds scenario URL from source with path only', () => {
        const url = scenarioLink({ path: 'auth.spec.ts' });
        expect(url).toBe('/tests/auth.spec.ts');
    });

    test('prefers line over name', () => {
        const url = scenarioLink({ path: 'auth.spec.ts', line: 42, name: 'ignored' });
        expect(url).toBe('/tests/auth.spec.ts%3A42');
    });

    test('accepts additional options', () => {
        const url = scenarioLink({ path: 'auth.spec.ts', line: 42 }, { run: '8333', browser: 'firefox' });
        expect(url).toBe('/tests/auth.spec.ts%3A42?run=8333&browser=firefox');
    });

    test('handles undefined line', () => {
        const url = scenarioLink({ path: 'auth.spec.ts', line: undefined });
        expect(url).toBe('/tests/auth.spec.ts');
    });

    test('encodes special characters in name', () => {
        const url = scenarioLink({ path: 'test.spec.ts', name: 'test @ runtime' });
        expect(url).toContain('test%20%40%20runtime');
    });
});

test.describe('capabilityLink() — convenience function', () => {

    test('builds capability URL with path', () => {
        const url = capabilityLink('authentication/login');
        expect(url).toBe('/capabilities?path=authentication%2Flogin');
    });

    test('encodes slashes in path', () => {
        const url = capabilityLink('features/auth/oauth');
        expect(url).toContain('features%2Fauth%2Foauth');
    });
});
