import expect = require('../../expect');

import { Scene, SceneFinished, SceneStarts, Tag } from '../../../src/serenity/domain';
import { spawner } from '../../support/spawner';

describe('When working with Cucumber', function () {

    this.timeout(30 * 1000);    // it might take a while to start up the selenium server

    const protractor = spawner(
        process.cwd() + '/node_modules/.bin/protractor',
        { cwd: __dirname, silent: true },
    );

    describe('Serenity/JS', () => {

        it('recognises single-value scenario tags', () => {

            let spawned = protractor('protractor.conf.js',
                '--specs', '**/recognises_single_value_tags.feature',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                let sceneStarts = spawned.messages[0];

                expect(sceneStarts).to.be.instanceOf(SceneStarts);
                expect(sceneStarts.value).to.be.instanceOf(Scene);
                expect(sceneStarts.value.tags).to.deep.equal([
                    new Tag('cucumber'),
                    new Tag('regression'),
                    new Tag('issue', [ 'MY-PROJECT-123' ]),
                ]);

                let sceneFinished = spawned.messages.pop();

                expect(sceneFinished).to.be.instanceOf(SceneFinished);
                expect(sceneFinished.value.subject).to.be.instanceOf(Scene);
                expect(sceneFinished.value.subject.tags).to.deep.equal([
                    new Tag('cucumber'),
                    new Tag('regression'),
                    new Tag('issue', [ 'MY-PROJECT-123' ]),
                ]);
            });
        });

        it('recognises multi-value scenario tags', () => {

            let spawned = protractor('protractor.conf.js',
                '--specs', '**/recognises_multi_value_tags.feature',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                let sceneStarts = spawned.messages[0];

                expect(sceneStarts).to.be.instanceOf(SceneStarts);
                expect(sceneStarts.value).to.be.instanceOf(Scene);
                expect(sceneStarts.value.tags).to.deep.equal([
                    new Tag('cucumber'),
                    new Tag('regression'),
                    new Tag('issues', [ 'MY-PROJECT-123', 'MY-PROJECT-789' ]),
                ]);

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
