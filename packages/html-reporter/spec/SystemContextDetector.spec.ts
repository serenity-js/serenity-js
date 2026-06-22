import { expect, test } from '@playwright/test';
import { ModuleLoader } from '@serenity-js/core/io';

import { CIDetector } from '../src/CiDetector.js';
import { SystemContextDetector } from '../src/SystemContextDetector.js';

test.describe('SystemContextDetector', () => {

    const moduleLoader = new ModuleLoader(process.cwd());

    test('detects Node.js version', () => {
        const detector = new SystemContextDetector(new CIDetector({}), moduleLoader);

        const context = detector.detect();

        expect(context.nodeVersion).toBe(process.version);
    });

    test('detects operating system info', () => {
        const detector = new SystemContextDetector(new CIDetector({}), moduleLoader);

        const context = detector.detect();

        expect(context.os).toHaveProperty('name');
        expect(typeof context.os.name).toBe('string');
        expect(context.os).toHaveProperty('version');
        expect(typeof context.os.version).toBe('string');
        expect(context.os).toHaveProperty('arch');
        expect(typeof context.os.arch).toBe('string');
    });

    test('detects Serenity/JS version as a Version object', () => {
        const detector = new SystemContextDetector(new CIDetector({}), moduleLoader);

        const context = detector.detect();

        expect(context.serenityVersion.toString()).toMatch(/^\d+\.\d+\.\d+/);
    });

    test('detects package manager', () => {
        const detector = new SystemContextDetector(new CIDetector({}), moduleLoader);

        const context = detector.detect();

        expect(typeof context.packageManager).toBe('string');
        expect(['pnpm', 'yarn', 'npm', 'bun']).toContain(context.packageManager);
    });

    test('detects project name from package.json', () => {
        const detector = new SystemContextDetector(new CIDetector({}), moduleLoader);

        const context = detector.detect();

        expect(typeof context.projectName).toBe('string');
    });

    test('allows projectName to be overridden via config', () => {
        const detector = new SystemContextDetector(new CIDetector({}), moduleLoader, { projectName: 'My Custom Project' });

        const context = detector.detect();

        expect(context.projectName).toBe('My Custom Project');
    });

    test('includes CI runtime context when running in CI', () => {
        const ciDetector = new CIDetector({
            GITHUB_ACTIONS: 'true',
            GITHUB_RUN_NUMBER: '42',
            GITHUB_REF_NAME: 'main',
            GITHUB_SHA: 'abc123def456',
            GITHUB_SERVER_URL: 'https://github.com',
            GITHUB_REPOSITORY: 'org/repo',
            GITHUB_RUN_ID: '999',
        });
        const detector = new SystemContextDetector(ciDetector, moduleLoader);

        const context = detector.detect();

        expect(context.runtime.provider).toBe('GitHub Actions');
        expect(context.runtime.buildNumber).toBe('42');
    });

    test('provides local runtime context when not running in CI', () => {
        const detector = new SystemContextDetector(new CIDetector({}), moduleLoader);

        const context = detector.detect();

        expect(typeof context.runtime.provider).toBe('string');
        expect(context.runtime.provider).toBeTruthy();
        expect(typeof context.runtime.buildNumber).toBe('string');
        expect(context.runtime.buildNumber).toBeTruthy();
        expect(typeof context.runtime.branch).toBe('string');
        expect(context.runtime.branch).toBeTruthy();
        expect(typeof context.runtime.commit).toBe('string');
        expect(context.runtime.commit).toBeTruthy();
    });
});
