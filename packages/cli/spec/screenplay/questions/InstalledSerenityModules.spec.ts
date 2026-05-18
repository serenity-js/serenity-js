import { expect } from '@integration/testing-tools';
import { Actor } from '@serenity-js/core';
import { CorrelationId } from '@serenity-js/core/lib/model';
import { Stage } from '@serenity-js/core/lib/stage';
import { vol } from 'memfs';
import { beforeEach, describe, it } from 'mocha';
import * as sinon from 'sinon';

import { InstalledSerenityModules, UseNodeModules } from '../../../src';

describe('InstalledSerenityModules', () => {

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

    it('returns list of installed @serenity-js/* packages with versions', async () => {
        const mockFs = {
            '/project/node_modules/@serenity-js/core/package.json': JSON.stringify({
                name: '@serenity-js/core',
                version: '3.42.0',
            }),
            '/project/node_modules/@serenity-js/web/package.json': JSON.stringify({
                name: '@serenity-js/web',
                version: '3.42.0',
            }),
        };

        vol.fromJSON(mockFs);

        const alice = actor('Alice').whoCan(
            UseNodeModules.at('/project', vol as any)
        );

        const modules = await alice.answer(InstalledSerenityModules());

        expect(modules).to.have.length(2);
        expect(modules.map(m => m.name)).to.include('@serenity-js/core');
        expect(modules.map(m => m.name)).to.include('@serenity-js/web');
        expect(modules[0].version).to.equal('3.42.0');

        vol.reset();
    });

    it('returns empty array when no modules found', async () => {
        vol.fromJSON({ '/project/package.json': '{}' });

        const alice = actor('Alice').whoCan(
            UseNodeModules.at('/project', vol as any)
        );

        const modules = await alice.answer(InstalledSerenityModules());

        expect(modules).to.be.an('array');
        expect(modules).to.have.length(0);

        vol.reset();
    });

    it('has a meaningful description', () => {
        const question = InstalledSerenityModules();

        expect(question.toString()).to.equal('installed Serenity/JS modules');
    });
});
