import { expect } from '@integration/testing-tools';
import { Actor } from '@serenity-js/core';
import { CorrelationId } from '@serenity-js/core/lib/model';
import { Stage } from '@serenity-js/core/lib/stage';
import { beforeEach, describe, it } from 'mocha';
import * as sinon from 'sinon';

import { FetchRemoteResources, MODULE_MANAGER_URL, ModuleManagerConfig } from '../../../src';

describe('ModuleManagerConfig', () => {

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

    it('fetches and returns module-manager.json', async () => {
        const mockConfig = {
            engines: { node: '^20 || ^22 || ^24' },
            packages: {
                '@serenity-js/core': '3.42.0',
                '@serenity-js/web': '3.42.0',
            },
            integrations: {
                'playwright-core': '~1.58.0',
            },
        };

        const mockAxios = {
            get: sinon.stub().resolves({ data: mockConfig }),
        };

        const alice = actor('Alice').whoCan(
            FetchRemoteResources.using(mockAxios as any)
        );

        const config = await alice.answer(ModuleManagerConfig());

        expect(config).to.deep.equal(mockConfig);
        expect(mockAxios.get).to.have.been.calledWith(MODULE_MANAGER_URL);
    });

    it('handles network errors gracefully', async () => {
        const mockAxios = {
            get: sinon.stub().rejects(new Error('Network Error')),
        };

        const alice = actor('Alice').whoCan(
            FetchRemoteResources.using(mockAxios as any)
        );

        await expect(alice.answer(ModuleManagerConfig()))
            .to.be.rejectedWith(/Failed to fetch/);
    });

    it('has a meaningful description', () => {
        const question = ModuleManagerConfig();

        expect(question.toString()).to.equal('module manager configuration');
    });

    it('exports the MODULE_MANAGER_URL constant', () => {
        expect(MODULE_MANAGER_URL).to.equal('https://serenity-js.org/presets/v3/module-manager.json');
    });
});
