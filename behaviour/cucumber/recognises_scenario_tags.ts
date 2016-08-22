import { SceneFinished } from '../../src/serenity/domain';
import { spawner } from '../spawner';

import expect = require('../expect');
import { SceneStarts } from '../../src/serenity/domain/events';
import { Scene, Tag } from '../../src/serenity/domain/model';

describe('When working with Cucumber', () => {

    const cucumberjs = spawner(
        process.cwd() + '/node_modules/.bin/cucumber-js',
        { cwd: __dirname, silent: true }
    );

    describe('Serenity/JS', () => {

        it('recognises scenario tags when the Scene starts', () => {

            let spawned = cucumberjs('--name', 'A regression test covering one issue');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                let sceneStarts = spawned.messages[0];

                expect(sceneStarts).to.be.instanceOf(SceneStarts);
                expect(sceneStarts.value).to.be.instanceOf(Scene);
                expect(sceneStarts.value.tags).to.deep.equal([
                    new Tag('cucumber'),
                    new Tag('regression'),
                    new Tag('issue', [ 'MY-PROJECT-123' ]),
                ]);
            });
        });

        it('recognises scenario tags when the Scene is finished', () => {

            let spawned = cucumberjs('--name', 'A regression test covering two issues');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                let sceneFinished = spawned.messages.pop();

                expect(sceneFinished).to.be.instanceOf(SceneFinished);
                expect(sceneFinished.value.subject).to.be.instanceOf(Scene);
                expect(sceneFinished.value.subject.tags).to.deep.equal([
                    new Tag('cucumber'),
                    new Tag('regression'),
                    new Tag('issues', [ 'MY-PROJECT-123', 'MY-PROJECT-789' ]),
                ]);
            });
        });
    });
});
