const
    { actorCalled } = require('@serenity-js/core'),
    { Navigate, UseAngular } = require('@serenity-js/protractor');

describe('Jasmine', () => {

    describe('A screenplay scenario', () => {

        beforeEach(() => actorCalled('Jasmine').attemptsTo(
            UseAngular.disableSynchronisation(),
            Navigate.to('chrome://version/'),
        ));

        it('passes', () => actorCalled('Jasmine').attemptsTo(
            Navigate.to('chrome://accessibility/'),
        ));

        afterEach(() => actorCalled('Jasmine').attemptsTo(
            Navigate.to('chrome://chrome-urls/'),
        ));
    });
});
