import { execSync } from 'node:child_process';
import * as path from 'node:path';

import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

describe('sjs cli check-updates', () => {

    const cliPath = path.resolve(__dirname, '../../../packages/cli/bin/sjs');

    describe('when run in a project with Serenity/JS modules', () => {

        const fixtureDirectory = path.resolve(__dirname, '../fixtures/project-with-all-modules');

        it('returns valid JSON with update report', () => {
            const result = execSync(`node ${ cliPath } cli check-updates`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            expect(response).to.have.property('success', true);
            expect(response).to.have.property('data');
            expect(response.data).to.have.property('upToDate');
            expect(response.data).to.have.property('updates');
            expect(response.data).to.have.property('updateCommand');
        });

        it('reports upToDate status', () => {
            const result = execSync(`node ${ cliPath } cli check-updates`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            expect(response.data.upToDate).to.be.a('boolean');
        });

        it('includes update information for each outdated module', () => {
            const result = execSync(`node ${ cliPath } cli check-updates`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            expect(response.data.updates).to.be.an('array');

            for (const update of response.data.updates) {
                expect(update).to.have.property('name');
                expect(update).to.have.property('currentVersion');
                expect(update).to.have.property('latestVersion');
                expect(update.name).to.match(/^@serenity-js\//);
            }
        });

        it('includes update command for detected package manager', () => {
            const result = execSync(`node ${ cliPath } cli check-updates`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            // updateCommand can be null if all modules are up to date
            if (response.data.updates.length > 0) {
                expect(response.data.updateCommand).to.be.a('string');
                expect(response.data.updateCommand).to.match(/npm|yarn|pnpm/);
            }
        });
    });

    describe('when run in a project with no Serenity/JS modules', () => {

        const fixtureDirectory = path.resolve(__dirname, '../fixtures/project-with-no-modules');

        it('returns upToDate true with empty updates array', () => {
            const result = execSync(`node ${ cliPath } cli check-updates`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            expect(response).to.have.property('success', true);
            expect(response.data.upToDate).to.equal(true);
            expect(response.data.updates).to.be.an('array');
            expect(response.data.updates).to.have.length(0);
        });
    });

    describe('when run in a project with outdated modules', () => {

        const fixtureDirectory = path.resolve(__dirname, '../fixtures/project-with-outdated-modules');

        it('reports upToDate false with updates array', () => {
            const result = execSync(`node ${ cliPath } cli check-updates`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            expect(response).to.have.property('success', true);
            expect(response.data.upToDate).to.equal(false);
            expect(response.data.updates).to.have.length.greaterThan(0);
        });

        it('includes correct version information for outdated modules', () => {
            const result = execSync(`node ${ cliPath } cli check-updates`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            const coreUpdate = response.data.updates.find((u: { name: string }) => u.name === '@serenity-js/core');
            expect(coreUpdate).to.exist;
            expect(coreUpdate.currentVersion).to.equal('3.0.0');
            // latestVersion should be the current version from module-manager.json
        });

        it('generates correct update command', () => {
            const result = execSync(`node ${ cliPath } cli check-updates`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            expect(response.data.updateCommand).to.be.a('string');
            // Should include npm since the fixture has package-lock.json
            expect(response.data.updateCommand).to.include('npm');
            expect(response.data.updateCommand).to.include('@serenity-js/core');
        });
    });
});
