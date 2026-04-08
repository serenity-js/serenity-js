import { expect } from '@integration/testing-tools';
import { Actor } from '@serenity-js/core';
import { CorrelationId } from '@serenity-js/core/lib/model';
import { Stage } from '@serenity-js/core/lib/stage';
import { vol } from 'memfs';
import { beforeEach, describe, it } from 'mocha';
import * as sinon from 'sinon';

import { CheckInstallation, FetchRemoteResources, UseNodeModules } from '../../../src';

describe('CheckInstallation', () => {

    const
        sceneId = new CorrelationId('some-scene-id'),
        activityId = new CorrelationId('some-activity-id');

    let stage: sinon.SinonStubbedInstance<Stage>;

    beforeEach(() => {
        stage = sinon.createStubInstance(Stage);
        stage.assignNewActivityId.returns(activityId);
        stage.currentSceneId.returns(sceneId);
        stage.currentActivityId.returns(activityId);
    });

    function actor(name: string) {
        return new Actor(name, stage as unknown as Stage);
    }

    it('returns complete InstallationReport', async () => {
        const mockFs = {
            '/project/node_modules/@serenity-js/core/package.json': JSON.stringify({
                name: '@serenity-js/core',
                version: '3.42.0',
            }),
            '/project/node_modules/@serenity-js/playwright/package.json': JSON.stringify({
                name: '@serenity-js/playwright',
                version: '3.42.0',
            }),
            '/project/node_modules/playwright-core/package.json': JSON.stringify({
                name: 'playwright-core',
                version: '1.58.2',
            }),
        };

        vol.fromJSON(mockFs);

        const mockConfig = {
            engines: { node: '^20 || ^22 || ^24' },
            packages: {
                '@serenity-js/core': '3.42.0',
                '@serenity-js/playwright': '3.42.0',
            },
            integrations: {
                'playwright-core': '~1.58.0',
            },
        };

        const mockAxios = {
            get: sinon.stub().resolves({ data: mockConfig }),
        };

        const alice = actor('Alice').whoCan(
            UseNodeModules.at('/project', vol as any),
            FetchRemoteResources.using(mockAxios as any),
        );

        const report = await CheckInstallation.forProject().answeredBy(alice);

        expect(report).to.have.property('nodeVersion');
        expect(report).to.have.property('modules');
        expect(report).to.have.property('compatibility');

        expect(report.nodeVersion.current).to.match(/^v\d+\.\d+\.\d+$/);
        expect(report.nodeVersion.supported).to.be.a('boolean');
        expect(report.nodeVersion.requiredRange).to.equal('^20 || ^22 || ^24');

        expect(report.modules).to.be.an('array');
        expect(report.modules.length).to.be.greaterThan(0);

        expect(report.compatibility.status).to.be.oneOf(['compatible', 'incompatible', 'unknown']);

        vol.reset();
    });

    it('handles missing modules gracefully', async () => {
        vol.fromJSON({ '/project/package.json': '{}' });

        const mockConfig = {
            engines: { node: '^20 || ^22 || ^24' },
            packages: {},
            integrations: {},
        };

        const mockAxios = {
            get: sinon.stub().resolves({ data: mockConfig }),
        };

        const alice = actor('Alice').whoCan(
            UseNodeModules.at('/project', vol as any),
            FetchRemoteResources.using(mockAxios as any),
        );

        const report = await CheckInstallation.forProject().answeredBy(alice);

        expect(report.modules).to.be.an('array');
        expect(report.modules).to.have.length(0);
        expect(report.compatibility.status).to.equal('unknown');

        vol.reset();
    });

    it('has a meaningful description', () => {
        const task = CheckInstallation.forProject();

        expect(task.toString()).to.equal('check installation');
    });
});
