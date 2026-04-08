import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

import type { InstallationReport } from '../../src';

describe('InstallationReport', () => {

    it('contains nodeVersion with current, supported, and requiredRange', () => {
        const report: InstallationReport = {
            nodeVersion: {
                current: 'v22.11.0',
                supported: true,
                requiredRange: '^20 || ^22 || ^24',
            },
            modules: [],
            compatibility: {
                status: 'unknown',
                issues: [],
            },
        };

        expect(report.nodeVersion.current).to.equal('v22.11.0');
        expect(report.nodeVersion.supported).to.equal(true);
        expect(report.nodeVersion.requiredRange).to.equal('^20 || ^22 || ^24');
    });

    it('contains modules array with name, version, and path', () => {
        const report: InstallationReport = {
            nodeVersion: {
                current: 'v22.11.0',
                supported: true,
                requiredRange: '^20 || ^22 || ^24',
            },
            modules: [
                { name: '@serenity-js/core', version: '3.42.0', path: '/project/node_modules/@serenity-js/core' },
                { name: '@serenity-js/web', version: '3.42.0', path: '/project/node_modules/@serenity-js/web' },
            ],
            compatibility: {
                status: 'compatible',
                issues: [],
            },
        };

        expect(report.modules).to.have.length(2);
        expect(report.modules[0].name).to.equal('@serenity-js/core');
        expect(report.modules[0].version).to.equal('3.42.0');
        expect(report.modules[0].path).to.equal('/project/node_modules/@serenity-js/core');
    });

    it('contains compatibility with status and issues', () => {
        const report: InstallationReport = {
            nodeVersion: {
                current: 'v22.11.0',
                supported: true,
                requiredRange: '^20 || ^22 || ^24',
            },
            modules: [
                { name: '@serenity-js/playwright', version: '3.42.0', path: '/project/node_modules/@serenity-js/playwright' },
            ],
            compatibility: {
                status: 'incompatible',
                issues: [
                    {
                        module: '@serenity-js/playwright',
                        dependency: 'playwright-core',
                        installedVersion: '1.30.0',
                        requiredRange: '~1.58.0',
                        suggestion: 'Update playwright-core to a version matching ~1.58.0',
                    },
                ],
            },
        };

        expect(report.compatibility.status).to.equal('incompatible');
        expect(report.compatibility.issues).to.have.length(1);
        expect(report.compatibility.issues[0].module).to.equal('@serenity-js/playwright');
    });
});
