import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

import type { ModuleInfo, ModuleManagerJson } from '../../src';
import { checkCompatibility } from '../../src';

describe('CompatibilityChecker', () => {

    describe('checkCompatibility', () => {

        it('returns compatible when versions satisfy required ranges', () => {
            const installedModules: ModuleInfo[] = [
                { name: '@serenity-js/core', version: '3.42.0', path: '/project/node_modules/@serenity-js/core' },
                { name: '@serenity-js/playwright', version: '3.42.0', path: '/project/node_modules/@serenity-js/playwright' },
            ];

            const installedDependencies: Record<string, string> = {
                'playwright-core': '1.58.2',
            };

            const config: ModuleManagerJson = {
                engines: { node: '^20 || ^22 || ^24' },
                packages: {
                    '@serenity-js/core': '3.42.0',
                    '@serenity-js/playwright': '3.42.0',
                },
                integrations: {
                    'playwright-core': '~1.58.0',
                },
            };

            const result = checkCompatibility(installedModules, installedDependencies, config);

            expect(result.status).to.equal('compatible');
            expect(result.issues).to.have.length(0);
        });

        it('returns incompatible with issues when versions do not match', () => {
            const installedModules: ModuleInfo[] = [
                { name: '@serenity-js/playwright', version: '3.42.0', path: '/project/node_modules/@serenity-js/playwright' },
            ];

            const installedDependencies: Record<string, string> = {
                'playwright-core': '1.30.0',
            };

            const config: ModuleManagerJson = {
                engines: { node: '^20 || ^22 || ^24' },
                packages: {
                    '@serenity-js/playwright': '3.42.0',
                },
                integrations: {
                    'playwright-core': '~1.58.0',
                },
            };

            const result = checkCompatibility(installedModules, installedDependencies, config);

            expect(result.status).to.equal('incompatible');
            expect(result.issues).to.have.length(1);
            expect(result.issues[0].module).to.equal('@serenity-js/playwright');
            expect(result.issues[0].dependency).to.equal('playwright-core');
            expect(result.issues[0].installedVersion).to.equal('1.30.0');
            expect(result.issues[0].requiredRange).to.equal('~1.58.0');
        });

        it('checks Playwright compatibility per matrix', () => {
            const installedModules: ModuleInfo[] = [
                { name: '@serenity-js/playwright', version: '3.42.0', path: '/project/node_modules/@serenity-js/playwright' },
            ];

            const installedDependencies: Record<string, string> = {
                'playwright-core': '1.58.2',
            };

            const config: ModuleManagerJson = {
                engines: { node: '^20 || ^22 || ^24' },
                packages: {
                    '@serenity-js/playwright': '3.42.0',
                },
                integrations: {
                    'playwright-core': '~1.58.0',
                },
            };

            const result = checkCompatibility(installedModules, installedDependencies, config);

            expect(result.status).to.equal('compatible');
        });

        it('checks WebdriverIO compatibility per matrix', () => {
            const installedModules: ModuleInfo[] = [
                { name: '@serenity-js/webdriverio', version: '3.42.0', path: '/project/node_modules/@serenity-js/webdriverio' },
            ];

            const installedDependencies: Record<string, string> = {
                'webdriverio': '8.46.0',
            };

            const config: ModuleManagerJson = {
                engines: { node: '^20 || ^22 || ^24' },
                packages: {
                    '@serenity-js/webdriverio': '3.42.0',
                },
                integrations: {
                    'webdriverio': '^8.46.0',
                },
            };

            const result = checkCompatibility(installedModules, installedDependencies, config);

            expect(result.status).to.equal('compatible');
        });

        it('returns unknown when no integrations to check', () => {
            const installedModules: ModuleInfo[] = [
                { name: '@serenity-js/core', version: '3.42.0', path: '/project/node_modules/@serenity-js/core' },
            ];

            const installedDependencies: Record<string, string> = {};

            const config: ModuleManagerJson = {
                engines: { node: '^20 || ^22 || ^24' },
                packages: {
                    '@serenity-js/core': '3.42.0',
                },
                integrations: {},
            };

            const result = checkCompatibility(installedModules, installedDependencies, config);

            expect(result.status).to.equal('unknown');
            expect(result.issues).to.have.length(0);
        });

        it('includes suggestion in compatibility issues', () => {
            const installedModules: ModuleInfo[] = [
                { name: '@serenity-js/playwright', version: '3.42.0', path: '/project/node_modules/@serenity-js/playwright' },
            ];

            const installedDependencies: Record<string, string> = {
                'playwright-core': '1.30.0',
            };

            const config: ModuleManagerJson = {
                engines: { node: '^20 || ^22 || ^24' },
                packages: {
                    '@serenity-js/playwright': '3.42.0',
                },
                integrations: {
                    'playwright-core': '~1.58.0',
                },
            };

            const result = checkCompatibility(installedModules, installedDependencies, config);

            expect(result.issues[0].suggestion).to.include('playwright-core');
            expect(result.issues[0].suggestion).to.include('~1.58.0');
        });

        it('handles multiple incompatibilities', () => {
            const installedModules: ModuleInfo[] = [
                { name: '@serenity-js/playwright', version: '3.42.0', path: '/project/node_modules/@serenity-js/playwright' },
                { name: '@serenity-js/cucumber', version: '3.42.0', path: '/project/node_modules/@serenity-js/cucumber' },
            ];

            const installedDependencies: Record<string, string> = {
                'playwright-core': '1.30.0',
                '@cucumber/cucumber': '7.0.0',
            };

            const config: ModuleManagerJson = {
                engines: { node: '^20 || ^22 || ^24' },
                packages: {
                    '@serenity-js/playwright': '3.42.0',
                    '@serenity-js/cucumber': '3.42.0',
                },
                integrations: {
                    'playwright-core': '~1.58.0',
                    '@cucumber/cucumber': '^10.0.0 || ^11.0.0 || ^12.0.0',
                },
            };

            const result = checkCompatibility(installedModules, installedDependencies, config);

            expect(result.status).to.equal('incompatible');
            expect(result.issues).to.have.length(2);
        });
    });
});
