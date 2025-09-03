import { describe, it } from 'mocha';
import path = require('path');

import { ModuleLoader, Version } from '../../../src/io';
import { expect } from '../../expect';

describe('ModuleLoader', () => {

    describe('hasAvailable', () => {

        describe('when checking if a given module is available to be required', () => {

            it('returns true if a CJS module is available', () => {
                const loader = new ModuleLoader(__dirname);

                expect(loader.hasAvailable('tiny-types')).to.equal(true);
            });

            it('returns true if an ESM module is available', () => {
                const loader = new ModuleLoader(__dirname);

                expect(loader.hasAvailable('./examples/esm/index.mjs')).to.equal(true);
            });

            it('returns false if the module is not available', () => {
                const loader = new ModuleLoader(__dirname);

                expect(loader.hasAvailable('non-existent-module')).to.equal(false);
            });
        });
    });

    describe('versionOf', () => {

        it('returns the version number of the given CJS package', () => {
            const loader = new ModuleLoader(__dirname);

            const expectedVersion = require('../../../package.json').version;  // eslint-disable-line @typescript-eslint/no-var-requires

            expect(loader.versionOf('../../../')).to.equal(new Version(expectedVersion));
        });

        it('returns the version number of the given ESM package', () => {
            const loader = new ModuleLoader(__dirname);

            const expectedVersion = require('./examples/esm/package.json').version; // eslint-disable-line @typescript-eslint/no-var-requires

            expect(loader.versionOf('./examples/esm')).to.equal(new Version(expectedVersion));
        });

        it('returns the version of the npm-resolved package if the local package could not be found', () => {
            const loader = new ModuleLoader(path.join(__dirname, 'non-existent', 'local', 'directory'));

            const expectedVersion = require('tiny-types/package.json').version; // eslint-disable-line @typescript-eslint/no-var-requires

            expect(loader.versionOf('tiny-types')).to.equal(new Version(expectedVersion));
        });

        it('complains if neither a local version or the npm-resolved version could be found', () => {
            const loader = new ModuleLoader(__dirname);

            expect(() => loader.versionOf('non-existent-module')).to.throw(Error, `Cannot find module 'non-existent-module/package.json'`);
        });
    });

    describe('resolve', () => {

        it('resolves a module relative to the current working directory', () => {
            const loader = new ModuleLoader(__dirname);

            const expectedPath = require.resolve('tiny-types');

            const result = loader.resolve('tiny-types');

            expect(result).to.equal(expectedPath);
        });

        it('resolves a module relative to the current working directory, even if it is an ESM module', () => {
            const loader = new ModuleLoader(__dirname);

            const result = loader.resolve('./examples/esm/index.mjs');
            const expectedPath = path.join(__dirname, 'examples', 'esm', 'index.mjs');

            expect(result).to.equal(expectedPath);
        });

        it(`returns the module id if it can't be resolved`, () => {
            const loader = new ModuleLoader(__dirname);

            const result = loader.resolve('non-existent-module');

            expect(result).to.equal('non-existent-module');
        });
    });

    describe('require', () => {

        it('requires a CJS module relative to the current working directory', () => {
            const loader = new ModuleLoader(__dirname);

            const expectedModule = require('tiny-types'); // eslint-disable-line @typescript-eslint/no-var-requires

            const result = loader.require('tiny-types');

            expect(result).to.equal(expectedModule);
        });

        it(`complains if the module can't be required`, () => {
            const loader = new ModuleLoader(__dirname);

            expect(() => loader.require('non-existent-module')).to.throw(Error, `Cannot find module 'non-existent-module'`);
        });
    });

    describe('import', () => {

        it('imports an ESM module relative to the current working directory', async () => {
            const loader = new ModuleLoader(__dirname);

            const expectedModule = await import('tiny-types');

            const result = await loader.import('tiny-types');

            expect(result).to.equal(expectedModule);
        });

        it('imports a local ESM module relative to the current working directory', async () => {

            const loader = new ModuleLoader(__dirname);

            const result = await loader.import('./examples/esm/index.mjs');

            expect(result).to.have.property('example');
        });

        it(`complains if the module can't be imported`, async () => {
            const loader = new ModuleLoader(__dirname);

            await expect(loader.import('non-existent-module'))
                .to.be.eventually.rejectedWith(Error, `Cannot find package 'non-existent-module'`);
        });
    });

    describe('load', () => {
        it('loads a CJS module relative to the current working directory', async () => {
            const loader = new ModuleLoader(__dirname);

            const expectedModule = require('tiny-types'); // eslint-disable-line @typescript-eslint/no-var-requires

            const result = await loader.load('tiny-types');

            expect(result).to.equal(expectedModule);
        });

        it('loads an ESM module relative to the current working directory', async () => {
            const loader = new ModuleLoader(__dirname);

            const expectedModule = await import('tiny-types');

            const result = await loader.load('tiny-types');

            expect(result).to.equal(expectedModule);
        });

        it(`complains if the module can't be loaded`, async () => {
            const loader = new ModuleLoader(__dirname);

            await expect(loader.load('non-existent-module'))
                .to.be.eventually.rejectedWith(Error, `Cannot find module 'non-existent-module'`);
        });
    });
});
