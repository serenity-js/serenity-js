const { TestCompromisedError } = require('@serenity-js/core');

describe('Mocha reporting', () => {

    describe('A scenario', () => {

        it('is compromised', () => {
            throw new TestCompromisedError(`DB is down, pleas cheer it up`);
        });
    });
});
