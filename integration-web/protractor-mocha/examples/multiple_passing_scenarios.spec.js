const
    { actorCalled } = require('@serenity-js/core'),
    { Navigate } = require('@serenity-js/web'),
    { UseAngular } = require('@serenity-js/protractor');

describe('Mocha', () => {

    describe('A scenario', () => {

        it('passes the first time', () => actorCalled('Mocha').attemptsTo(
            UseAngular.disableSynchronisation(),
            Navigate.to('chrome://version/'),
        ));

        it('passes the second time', () => actorCalled('Mocha').attemptsTo(
            UseAngular.disableSynchronisation(),
            Navigate.to('chrome://accessibility/'),
        ));

        it('passes the third time', () => actorCalled('Mocha').attemptsTo(
            UseAngular.disableSynchronisation(),
            Navigate.to('chrome://chrome-urls/'),
        ));
    });
});
