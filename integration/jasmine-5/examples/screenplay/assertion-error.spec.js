const
    { actorCalled } = require('@serenity-js/core'),
    { Ensure, equals } = require('@serenity-js/assertions');

describe('Jasmine reporting', () => {

    describe('A screenplay scenario', () => {

        it('correctly reports assertion errors', () =>
            actorCalled('Donald').attemptsTo(
                Ensure.that(false, equals(true)),
            ));
    });
});
