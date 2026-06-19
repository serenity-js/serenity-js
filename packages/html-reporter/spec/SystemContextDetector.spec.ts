import { expect } from '@integration/testing-tools';
import { ModuleLoader } from '@serenity-js/core/io';
import { describe, it } from 'mocha';

import { CIDetector } from '../src/CiDetector.js';
import { SystemContextDetector } from '../src/SystemContextDetector.js';

describe('SystemContextDetector', () => {

    const moduleLoader = new ModuleLoader(process.cwd());

    it('detects Node.js version', () => {
        const detector = new SystemContextDetector(new CIDetector({}), moduleLoader);

        const context = detector.detect();

        expect(context.nodeVersion).to.equal(process.version);
    });

    it('detects operating system info', () => {
        const detector = new SystemContextDetector(new CIDetector({}), moduleLoader);

        const context = detector.detect();

        expect(context.os).to.have.property('name').that.is.a('string');
        expect(context.os).to.have.property('version').that.is.a('string');
        expect(context.os).to.have.property('arch').that.is.a('string');
    });

    it('detects Serenity/JS version as a Version object', () => {
        const detector = new SystemContextDetector(new CIDetector({}), moduleLoader);

        const context = detector.detect();

        expect(context.serenityVersion.toString()).to.match(/^\d+\.\d+\.\d+/);
    });

    it('detects package manager', () => {
        const detector = new SystemContextDetector(new CIDetector({}), moduleLoader);

        const context = detector.detect();

        expect(context.packageManager).to.be.a('string').that.is.oneOf(['pnpm', 'yarn', 'npm', 'bun']);
    });

    it('detects project name from package.json', () => {
        const detector = new SystemContextDetector(new CIDetector({}), moduleLoader);

        const context = detector.detect();

        expect(context.projectName).to.be.a('string');
    });

    it('allows projectName to be overridden via config', () => {
        const detector = new SystemContextDetector(new CIDetector({}), moduleLoader, { projectName: 'My Custom Project' });

        const context = detector.detect();

        expect(context.projectName).to.equal('My Custom Project');
    });

    it('includes CI runtime context when running in CI', () => {
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

        expect(context.runtime.provider).to.equal('GitHub Actions');
        expect(context.runtime.buildNumber).to.equal('42');
    });

    it('provides local runtime context when not running in CI', () => {
        const detector = new SystemContextDetector(new CIDetector({}), moduleLoader);

        const context = detector.detect();

        expect(context.runtime.provider).to.be.a('string').that.is.not.empty;
        expect(context.runtime.buildNumber).to.be.a('string').that.is.not.empty;
        expect(context.runtime.branch).to.be.a('string').that.is.not.empty;
        expect(context.runtime.commit).to.be.a('string').that.is.not.empty;
    });
});
