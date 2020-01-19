const
    { Actor } = require('@serenity-js/core'),
    { BrowseTheWeb, Navigate, UseAngular } = require('@serenity-js/protractor'),
    { protractor } = require('protractor');

describe('Jasmine', () => {

    const Jasmine = Actor.named('Jasmine').whoCan(
        BrowseTheWeb.using(protractor.browser),
    );

    describe('A screenplay scenario', () => {

        beforeEach(() => Jasmine.attemptsTo(
            UseAngular.disableSynchronisation(),
            Navigate.to('chrome://version/'),
        ));

        it('passes', () => Jasmine.attemptsTo(
            Navigate.to('chrome://accessibility/'),
        ));

        afterEach(() => Jasmine.attemptsTo(
            Navigate.to('chrome://chrome-urls/'),
        ));
    });
});
