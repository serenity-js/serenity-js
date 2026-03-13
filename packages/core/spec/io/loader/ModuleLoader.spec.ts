import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it } from 'mocha';

import { ModuleLoader, Version } from '../../../src/io';
import { expect } from '../../expect';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ModuleLoader', () => {

    it('returns the version number of a given package', () => {
        const loader = new ModuleLoader(__dirname);

        const expectedVersion = require('../../../package.json').version as string;

        expect(loader.versionOf('../../../')).to.equal(new Version(expectedVersion));
    });

    it('returns the version of the npm-resolved package if the local package could not be found', () => {
        const loader = new ModuleLoader(path.join(__dirname, 'non-existent', 'local', 'directory'));

        const expectedVersion = require('tiny-types/package.json').version as string;

        expect(loader.versionOf('tiny-types')).to.equal(new Version(expectedVersion));
    });

    it('complains if neither a local version or the npm-resolved version could be found', () => {
        const loader = new ModuleLoader(__dirname);

        expect(() => loader.versionOf('non-existent-module')).to.throw(Error, `Cannot find module 'non-existent-module/package.json'`);
    });

    describe('when checking if a given module is available to be required', () => {

        it('returns true if the module is available', () => {
            const loader = new ModuleLoader(__dirname);

            expect(loader.hasAvailable('tiny-types')).to.equal(true);
        });

        it('returns false if the module is not available', () => {
            const loader = new ModuleLoader(__dirname);

            expect(loader.hasAvailable('non-existent-module')).to.equal(false);
        });
    });
});
