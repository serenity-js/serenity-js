import expect = require('../../expect');

import { Result, SceneFinished } from '../../../src/serenity/domain';
import { spawner } from '../../support/spawner';

describe('When working with Mocha', function () {

    this.timeout(30 * 1000);    // it might take a while to start up the selenium server

    const protractor = spawner(
        process.cwd() + '/node_modules/.bin/protractor',
        { cwd: __dirname, silent: true },
    );

    // todo: tags: https://medium.com/@andrew_levine/tagging-tests-w-protractor-and-mocha-20b20bc10322#.cngxajsbf

    describe('Serenity/JS', () => {

        it ('reports passing scenarios', () => {
            let spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'A sample test that passes',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(2);

                let lastMessage = spawned.messages.pop();

                expect(lastMessage).to.be.instanceOf(SceneFinished);
                expect(Result[lastMessage.value.result]).to.equal(Result[Result.SUCCESS]);
            });
        });

        it ('reports pending scenarios', () => {
            let spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'A sample test that is pending',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(2);

                let lastMessage = spawned.messages.pop();

                expect(lastMessage).to.be.instanceOf(SceneFinished);
                expect(Result[lastMessage.value.result]).to.equal(Result[Result.PENDING]);
            });
        });

        it ('reports skipped scenarios', () => {
            let spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'A sample test that is skipped',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(2);

                let lastMessage = spawned.messages.pop();

                expect(lastMessage).to.be.instanceOf(SceneFinished);
                expect(Result[lastMessage.value.result]).to.equal(Result[Result.PENDING]);
            });
        });

        it('reports failing scenarios', () => {

            let spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'A sample test that fails',
            );

            return expect(spawned.result).to.be.eventually.rejected.then(() => {
                expect(spawned.messages).to.have.lengthOf(2);

                let lastMessage = spawned.messages.pop();

                expect(lastMessage).to.be.instanceOf(SceneFinished);
                expect(Result[lastMessage.value.result]).to.equal(Result[Result.FAILURE]);
            });
        });

        it ('recognises the name of the feature under test (the outer-most `describe`)', () => {
            let spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'A sample test that passes',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(2);

                expect(spawned.messages[0].value.category).to.equal('Integration with Mocha');
                expect(spawned.messages[1].value.subject.category).to.equal('Integration with Mocha');
            });
        });

        it ('recognises the name of the scenario', () => {
            let spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'A sample test that passes',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(2);

                expect(spawned.messages[0].value.name).to.equal('A sample test that passes');
                expect(spawned.messages[1].value.subject.name).to.equal('A sample test that passes');
            });
        });

    });
});
