import { execSync } from 'node:child_process';
import * as path from 'node:path';

import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

describe('sjs cli check-installation', () => {

    const cliPath = path.resolve(__dirname, '../../../packages/cli/bin/sjs');

    describe('when run in a project with Serenity/JS modules', () => {

        const fixtureDirectory = path.resolve(__dirname, '../fixtures/project-with-all-modules');

        it('returns valid JSON with installation report', () => {
            const result = execSync(`node ${ cliPath } cli check-installation`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            expect(response).to.have.property('success', true);
            expect(response).to.have.property('data');
            expect(response.data).to.have.property('nodeVersion');
            expect(response.data).to.have.property('modules');
            expect(response.data).to.have.property('compatibility');
        });

        it('reports Node.js version with supported status', () => {
            const result = execSync(`node ${ cliPath } cli check-installation`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            expect(response.data.nodeVersion).to.have.property('current');
            expect(response.data.nodeVersion).to.have.property('supported');
            expect(response.data.nodeVersion).to.have.property('requiredRange');
            expect(response.data.nodeVersion.current).to.match(/^v\d+\.\d+\.\d+$/);
            expect(response.data.nodeVersion.supported).to.be.a('boolean');
        });

        it('detects installed @serenity-js/* modules', () => {
            const result = execSync(`node ${ cliPath } cli check-installation`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            expect(response.data.modules).to.be.an('array');
            expect(response.data.modules.length).to.be.greaterThan(0);

            const moduleNames = response.data.modules.map((m: { name: string }) => m.name);
            expect(moduleNames).to.include('@serenity-js/core');
        });

        it('includes version information for each module', () => {
            const result = execSync(`node ${ cliPath } cli check-installation`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            for (const module of response.data.modules) {
                expect(module).to.have.property('name');
                expect(module).to.have.property('version');
                expect(module.name).to.match(/^@serenity-js\//);
                expect(module.version).to.match(/^\d+\.\d+\.\d+/);
            }
        });

        it('reports compatibility status', () => {
            const result = execSync(`node ${ cliPath } cli check-installation`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            expect(response.data.compatibility).to.have.property('status');
            expect(response.data.compatibility.status).to.be.oneOf(['compatible', 'incompatible', 'unknown']);
            expect(response.data.compatibility).to.have.property('issues');
            expect(response.data.compatibility.issues).to.be.an('array');
        });
    });

    describe('when run in a project with no Serenity/JS modules', () => {

        const fixtureDirectory = path.resolve(__dirname, '../fixtures/project-with-no-modules');

        it('returns empty modules array', () => {
            const result = execSync(`node ${ cliPath } cli check-installation`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            expect(response).to.have.property('success', true);
            expect(response.data.modules).to.be.an('array');
            expect(response.data.modules).to.have.length(0);
        });

        it('still reports Node.js version', () => {
            const result = execSync(`node ${ cliPath } cli check-installation`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            expect(response.data.nodeVersion).to.have.property('current');
            expect(response.data.nodeVersion).to.have.property('supported');
        });
    });

    describe('when run in a project with incompatible versions', () => {

        const fixtureDirectory = path.resolve(__dirname, '../fixtures/project-with-incompatible-versions');

        it('reports incompatible status with issues', () => {
            const result = execSync(`node ${ cliPath } cli check-installation`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            expect(response).to.have.property('success', true);
            expect(response.data.compatibility.status).to.equal('incompatible');
            expect(response.data.compatibility.issues).to.have.length.greaterThan(0);
        });

        it('includes details about each compatibility issue', () => {
            const result = execSync(`node ${ cliPath } cli check-installation`, {
                cwd: fixtureDirectory,
                encoding: 'utf-8',
            });

            const response = JSON.parse(result);

            for (const issue of response.data.compatibility.issues) {
                expect(issue).to.have.property('module');
                expect(issue).to.have.property('dependency');
                expect(issue).to.have.property('installedVersion');
                expect(issue).to.have.property('requiredRange');
                expect(issue).to.have.property('suggestion');
            }
        });
    });
});
