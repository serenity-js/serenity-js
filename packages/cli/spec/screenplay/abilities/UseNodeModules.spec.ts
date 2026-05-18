
import { expect } from '@integration/testing-tools';
import { vol } from 'memfs';
import { describe, it } from 'mocha';

import { UseNodeModules } from '../../../src';

describe('UseNodeModules', () => {

    describe('when scanning for Serenity/JS packages', () => {

        it('returns only @serenity-js/* packages', async () => {
            const mockFs = {
                '/project/node_modules/@serenity-js/core/package.json': JSON.stringify({
                    name: '@serenity-js/core',
                    version: '3.42.0',
                }),
                '/project/node_modules/@serenity-js/web/package.json': JSON.stringify({
                    name: '@serenity-js/web',
                    version: '3.42.0',
                }),
                '/project/node_modules/lodash/package.json': JSON.stringify({
                    name: 'lodash',
                    version: '4.17.21',
                }),
                '/project/node_modules/@types/node/package.json': JSON.stringify({
                    name: '@types/node',
                    version: '20.0.0',
                }),
            };

            vol.fromJSON(mockFs);

            const ability = UseNodeModules.at('/project', vol as any);
            const packages = await ability.listSerenityPackages();

            expect(packages).to.have.length(2);
            expect(packages.map(p => p.name)).to.include('@serenity-js/core');
            expect(packages.map(p => p.name)).to.include('@serenity-js/web');
            expect(packages.map(p => p.name)).to.not.include('lodash');
            expect(packages.map(p => p.name)).to.not.include('@types/node');

            vol.reset();
        });

        it('returns empty array when no Serenity/JS modules found', async () => {
            const mockFs = {
                '/project/node_modules/lodash/package.json': JSON.stringify({
                    name: 'lodash',
                    version: '4.17.21',
                }),
            };

            vol.fromJSON(mockFs);

            const ability = UseNodeModules.at('/project', vol as any);
            const packages = await ability.listSerenityPackages();

            expect(packages).to.be.an('array');
            expect(packages).to.have.length(0);

            vol.reset();
        });

        it('returns empty array when node_modules does not exist', async () => {
            vol.fromJSON({ '/project/package.json': '{}' });

            const ability = UseNodeModules.at('/project', vol as any);
            const packages = await ability.listSerenityPackages();

            expect(packages).to.be.an('array');
            expect(packages).to.have.length(0);

            vol.reset();
        });

        it('includes version from package.json', async () => {
            const mockFs = {
                '/project/node_modules/@serenity-js/core/package.json': JSON.stringify({
                    name: '@serenity-js/core',
                    version: '3.42.0',
                }),
            };

            vol.fromJSON(mockFs);

            const ability = UseNodeModules.at('/project', vol as any);
            const packages = await ability.listSerenityPackages();

            expect(packages).to.have.length(1);
            expect(packages[0].name).to.equal('@serenity-js/core');
            expect(packages[0].version).to.equal('3.42.0');

            vol.reset();
        });

        it('includes path to the module', async () => {
            const mockFs = {
                '/project/node_modules/@serenity-js/core/package.json': JSON.stringify({
                    name: '@serenity-js/core',
                    version: '3.42.0',
                }),
            };

            vol.fromJSON(mockFs);

            const ability = UseNodeModules.at('/project', vol as any);
            const packages = await ability.listSerenityPackages();

            expect(packages[0].path).to.equal('/project/node_modules/@serenity-js/core');

            vol.reset();
        });
    });

    describe('when reading package.json', () => {

        it('returns parsed package.json for a module', async () => {
            const mockFs = {
                '/project/node_modules/@serenity-js/core/package.json': JSON.stringify({
                    name: '@serenity-js/core',
                    version: '3.42.0',
                    description: 'Core module',
                }),
            };

            vol.fromJSON(mockFs);

            const ability = UseNodeModules.at('/project', vol as any);
            const pkg = await ability.readPackageJson('@serenity-js/core');

            expect(pkg.name).to.equal('@serenity-js/core');
            expect(pkg.version).to.equal('3.42.0');
            expect(pkg.description).to.equal('Core module');

            vol.reset();
        });

        it('throws when module does not exist', async () => {
            vol.fromJSON({ '/project/package.json': '{}' });

            const ability = UseNodeModules.at('/project', vol as any);

            await expect(ability.readPackageJson('@serenity-js/nonexistent'))
                .to.be.rejectedWith(/Cannot find module/);

            vol.reset();
        });
    });

    describe('when checking if a module exists', () => {

        it('returns true when module exists', async () => {
            const mockFs = {
                '/project/node_modules/playwright/package.json': JSON.stringify({
                    name: 'playwright',
                    version: '1.58.0',
                }),
            };

            vol.fromJSON(mockFs);

            const ability = UseNodeModules.at('/project', vol as any);
            const exists = await ability.moduleExists('playwright');

            expect(exists).to.equal(true);

            vol.reset();
        });

        it('returns false when module does not exist', async () => {
            vol.fromJSON({ '/project/package.json': '{}' });

            const ability = UseNodeModules.at('/project', vol as any);
            const exists = await ability.moduleExists('nonexistent');

            expect(exists).to.equal(false);

            vol.reset();
        });
    });
});
