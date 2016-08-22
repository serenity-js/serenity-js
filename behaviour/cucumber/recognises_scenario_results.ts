import { Result, SceneFinished } from '../../src/serenity/domain';
import { spawner } from '../spawner';

import expect = require('../expect');

describe('When working with Cucumber', () => {

    const cucumberjs = spawner(
        process.cwd() + '/node_modules/.bin/cucumber-js',
        { cwd: __dirname, silent: true }
    );

    describe('Serenity/JS', () => {

        it('reports passing scenarios', () => {

            let spawned = cucumberjs('--name', 'A passing scenario');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                let lastMessage = spawned.messages.pop();

                expect(lastMessage).to.be.instanceOf(SceneFinished);
                expect(Result[lastMessage.value.result]).to.equal(Result[Result.SUCCESS]);
            });
        });

        it('ignores skipped scenarios', () => {

            let spawned = cucumberjs('--name', 'A skipped scenario', '--tags', '~@wip');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(0);
            });
        });

        it('reports failing scenarios', () => {

            let spawned = cucumberjs('--name', 'A failing scenario');

            return expect(spawned.result).to.be.eventually.rejected.then(() => {

                let lastMessage = spawned.messages.pop();

                expect(lastMessage).to.be.instanceOf(SceneFinished);
                expect(Result[lastMessage.value.result]).to.equal(Result[Result.FAILURE]);
            });
        });
    });
});
