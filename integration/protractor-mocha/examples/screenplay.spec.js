const
    { actorCalled } = require('@serenity-js/core'),
    { Navigate } = require('@serenity-js/web'),
    { UseAngular } = require('@serenity-js/protractor');

describe('Mocha', () => {

    describe('A screenplay scenario', () => {

        beforeEach(() => actorCalled('Mocha').attemptsTo(
            UseAngular.disableSynchronisation(),
            Navigate.to('chrome://version/'),
        ));

        it('passes', () => actorCalled('Mocha').attemptsTo(
            Navigate.to('chrome://accessibility/'),
        ));

        afterEach(() => actorCalled('Mocha').attemptsTo(
            Navigate.to('chrome://chrome-urls/'),
        ));
    });
});
