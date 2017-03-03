import expect = require('../../expect');

import { RecordedScene, SceneFinished, SceneStarts, Tag } from '../../../src/serenity/domain';
import { spawner } from '../../support/spawner';

describe('When working with Cucumber', function() {

    this.timeout(30 * 1000);    // it might take a while to start up the selenium server

    const protractor = spawner(
        process.cwd() + '/node_modules/.bin/protractor',
        { cwd: __dirname, silent: true },
    );

    describe('Serenity/JS', () => {

        it('recognises single-value scenario tags', () => {

            const spawned = protractor('protractor.conf.js',
                '--specs', '**/recognises_single_value_tags.feature',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                const sceneStarts = spawned.messages[0];

                expect(sceneStarts).to.be.instanceOf(SceneStarts);
                expect(sceneStarts.value).to.be.instanceOf(RecordedScene);
                expect(sceneStarts.value.tags).to.deep.equal([
                    new Tag('cucumber'),
                    new Tag('regression'),
                    new Tag('issue', [ 'MY-PROJECT-123' ]),
                ]);

                const sceneFinished = spawned.messages.pop();

                expect(sceneFinished).to.be.instanceOf(SceneFinished);
                expect(sceneFinished.value.subject).to.be.instanceOf(RecordedScene);
                expect(sceneFinished.value.subject.tags).to.deep.equal([
                    new Tag('cucumber'),
                    new Tag('regression'),
                    new Tag('issue', [ 'MY-PROJECT-123' ]),
                ]);
            });
        });

        it('recognises multi-value scenario tags', () => {

            const spawned = protractor('protractor.conf.js',
                '--specs', '**/recognises_multi_value_tags.feature',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                const sceneStarts = spawned.messages[0];

                expect(sceneStarts).to.be.instanceOf(SceneStarts);
                expect(sceneStarts.value).to.be.instanceOf(RecordedScene);
                expect(sceneStarts.value.tags).to.deep.equal([
                    new Tag('cucumber'),
                    new Tag('regression'),
                    new Tag('issues', [ 'MY-PROJECT-123', 'MY-PROJECT-789' ]),
                ]);

                const sceneFinished = spawned.messages.pop();

                expect(sceneFinished).to.be.instanceOf(SceneFinished);
                expect(sceneFinished.value.subject).to.be.instanceOf(RecordedScene);
                expect(sceneFinished.value.subject.tags).to.deep.equal([
                    new Tag('cucumber'),
                    new Tag('regression'),
                    new Tag('issues', [ 'MY-PROJECT-123', 'MY-PROJECT-789' ]),
                ]);
            });
        });
    });
});
