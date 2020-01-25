const
    { actorCalled } = require('@serenity-js/core'),
    { UseAngular, Navigate } = require('@serenity-js/protractor');

describe('Jasmine', () => {

    describe('A scenario', () => {

        it('passes the first time', () => actorCalled('Jasmine').attemptsTo(
            UseAngular.disableSynchronisation(),
            Navigate.to('chrome://version/'),
        ));

        it('passes the second time', () => actorCalled('Jasmine').attemptsTo(
            UseAngular.disableSynchronisation(),
            Navigate.to('chrome://accessibility/'),
        ));

        it('passes the third time', () => actorCalled('Jasmine').attemptsTo(
            UseAngular.disableSynchronisation(),
            Navigate.to('chrome://chrome-urls/'),
        ));
    });
});
