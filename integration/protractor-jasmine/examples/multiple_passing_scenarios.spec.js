const
    { Actor } = require('@serenity-js/core'),
    { BrowseTheWeb, UseAngular, Navigate } = require('@serenity-js/protractor'),
    { protractor } = require('protractor');

describe('Jasmine', () => {

    describe('A scenario', () => {

        let Jasmine;

        beforeEach(() => {
            Jasmine = Actor.named('Jasmine').whoCan(
                BrowseTheWeb.using(protractor.browser),
            );
        });

        it('passes the first time', () => Jasmine.attemptsTo(
            UseAngular.disableSynchronisation(),
            Navigate.to('chrome://version/'),
        ));

        it('passes the second time', () => Jasmine.attemptsTo(
            UseAngular.disableSynchronisation(),
            Navigate.to('chrome://accessibility/'),
        ));

        it('passes the third time', () => Jasmine.attemptsTo(
            UseAngular.disableSynchronisation(),
            Navigate.to('chrome://chrome-urls/'),
        ));
    });
});
