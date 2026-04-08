import type * as fs from 'node:fs';

import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { CheckUpdates, FetchRemoteResources, UseNodeModules } from '../../../src';

describe('CheckUpdates', () => {

    it('returns complete UpdateReport', async () => {
        const mockFs = createMockFs({
            '@serenity-js/core': { name: '@serenity-js/core', version: '3.42.0' },
        }, {
            'package-lock.json': true,
        });

        const mockConfig = {
            engines: { node: '^20 || ^22 || ^24' },
            packages: { '@serenity-js/core': '3.42.0' },
            integrations: {},
        };

        const actor = createActorWith(mockFs, mockConfig);
        const report = await CheckUpdates.forProject().answeredBy(actor as any);

        expect(report).to.have.property('upToDate');
        expect(report).to.have.property('updates');
        expect(report).to.have.property('updateCommand');
    });

    it('reports upToDate true when all modules are current', async () => {
        const mockFs = createMockFs({
            '@serenity-js/core': { name: '@serenity-js/core', version: '3.42.0' },
        }, {
            'package-lock.json': true,
        });

        const mockConfig = {
            engines: { node: '^20 || ^22 || ^24' },
            packages: { '@serenity-js/core': '3.42.0' },
            integrations: {},
        };

        const actor = createActorWith(mockFs, mockConfig);
        const report = await CheckUpdates.forProject().answeredBy(actor as any);

        expect(report.upToDate).to.equal(true);
        expect(report.updates).to.have.length(0);
        expect(report.updateCommand).to.be.null;
    });

    it('reports upToDate false when modules are outdated', async () => {
        const mockFs = createMockFs({
            '@serenity-js/core': { name: '@serenity-js/core', version: '3.0.0' },
        }, {
            'package-lock.json': true,
        });

        const mockConfig = {
            engines: { node: '^20 || ^22 || ^24' },
            packages: { '@serenity-js/core': '3.42.0' },
            integrations: {},
        };

        const actor = createActorWith(mockFs, mockConfig);
        const report = await CheckUpdates.forProject().answeredBy(actor as any);

        expect(report.upToDate).to.equal(false);
        expect(report.updates).to.have.length(1);
        expect(report.updates[0]).to.deep.include({
            name: '@serenity-js/core',
            currentVersion: '3.0.0',
            latestVersion: '3.42.0',
        });
    });

    it('generates npm update command', async () => {
        const mockFs = createMockFs({
            '@serenity-js/core': { name: '@serenity-js/core', version: '3.0.0' },
        }, {
            'package-lock.json': true,
        });

        const mockConfig = {
            engines: { node: '^20 || ^22 || ^24' },
            packages: { '@serenity-js/core': '3.42.0' },
            integrations: {},
        };

        const actor = createActorWith(mockFs, mockConfig);
        const report = await CheckUpdates.forProject().answeredBy(actor as any);

        expect(report.updateCommand).to.include('npm');
        expect(report.updateCommand).to.include('@serenity-js/core');
    });

    it('handles network errors gracefully', async () => {
        const mockFs = createMockFs({
            '@serenity-js/core': { name: '@serenity-js/core', version: '3.0.0' },
        }, {
            'package-lock.json': true,
        });

        const actor = createActorWith(mockFs, null); // null config simulates network error
        const report = await CheckUpdates.forProject().answeredBy(actor as any);

        // Should still return a valid report, just with unknown status
        expect(report).to.have.property('upToDate');
        expect(report).to.have.property('updates');
    });

    it('has a meaningful description', () => {
        const task = CheckUpdates.forProject();
        expect(task.toString()).to.include('check updates');
    });
});

function createMockFs(
    modules: Record<string, { name: string; version: string }>,
    files: Record<string, boolean>,
) {
    const serenityModules = Object.entries(modules)
        .filter(([name]) => name.startsWith('@serenity-js/'))
        .map(([name]) => ({
            name: name.split('/')[1],
            isDirectory: () => true,
        }));

    return {
        promises: {
            readdir: sinon.stub().callsFake(async (path: string) => {
                if (path.includes('@serenity-js')) {
                    return serenityModules;
                }
                return [];
            }),
            readFile: sinon.stub().callsFake(async (path: string) => {
                for (const [name, pkg] of Object.entries(modules)) {
                    if (path.includes(name.replace('@serenity-js/', ''))) {
                        return JSON.stringify(pkg);
                    }
                }
                throw new Error('Not found');
            }),
            access: sinon.stub().callsFake(async (path: string) => {
                // Check for lock files
                const filename = path.split('/').pop();
                if (filename && files[filename]) {
                    return;
                }
                // Check for @serenity-js directory
                if (path.includes('@serenity-js') && serenityModules.length > 0) {
                    return;
                }
                throw new Error('ENOENT');
            }),
        },
    } as unknown as typeof fs;
}

function createActorWith(mockFs: typeof fs, mockConfig: any) {
    const nodeModulesAbility = UseNodeModules.at('/test/project', mockFs);
    const fetchAbility = {
        fetch: async () => {
            if (mockConfig === null) {
                throw new Error('Network error');
            }
            return mockConfig;
        },
    };

    return {
        abilityTo: (abilityType: any) => {
            if (abilityType === UseNodeModules) {
                return nodeModulesAbility;
            }
            if (abilityType === FetchRemoteResources) {
                return fetchAbility;
            }
            throw new Error(`Unknown ability: ${ abilityType }`);
        },
        answer: async (question: any) => {
            return question.answeredBy({
                abilityTo: (abilityType: any) => {
                    if (abilityType === UseNodeModules) {
                        return nodeModulesAbility;
                    }
                    if (abilityType === FetchRemoteResources) {
                        return fetchAbility;
                    }
                    throw new Error(`Unknown ability: ${ abilityType }`);
                },
            });
        },
    };
}
