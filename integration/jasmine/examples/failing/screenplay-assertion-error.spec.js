const
    { Actor } = require('@serenity-js/core'),
    { Ensure, equals } = require('@serenity-js/assertions');

describe('Jasmine', () => {

    describe('A screenplay scenario', () => {

        const Donald = Actor.named('Donald').whoCan();

        it('correctly reports assertion errors', () => Donald.attemptsTo(
            Ensure.that(false, equals(true)),
        ));
    });
});
