import 'mocha';

import { expect } from '@integration/testing-tools';
import { endsWith, Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, TestCompromisedError } from '@serenity-js/core';
import { By, Navigate, Page, PageElement, Text } from '@serenity-js/web';

describe('Navigate', () => {

    describe('to(url)', () => {

        it('allows the actor to navigate to a desired destination', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/interactions/navigate/hello_world.html'),

                Ensure.that(Text.of(PageElement.located(By.css('h1'))), equals('Hello World')),
            ));

        it(`marks the test as compromised if the desired destination can't be reached`, () =>
            expect(actorCalled('Wendy').attemptsTo(
                Navigate.to('http://localhost:9898/invalid-destination'),
            )).to.be.rejectedWith(TestCompromisedError, `Couldn't navigate to http://localhost:9898/invalid-destination`).then((error: TestCompromisedError) => {
                expect(error.cause).to.be.instanceOf(Error);
                expect(error.cause.message).to.include('net::ERR_CONNECTION_REFUSED');
            }),
        );

        it('provides a sensible description of the interaction being performed', () => {
            expect(Navigate.to(`https://serenity-js.org`).toString())
                .to.equal(`#actor navigates to 'https://serenity-js.org'`);
        });

        it('correctly detects its invocation location', () => {
            const activity = Navigate.to(`https://serenity-js.org`);
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Navigate.spec.ts');
            expect(location.line).to.equal(34);
            expect(location.column).to.equal(39);
        });
    });

    describe('back', () => {

        it('allows the actor to navigate back in the browser history', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/interactions/navigate/first.html'),
                Navigate.to('/screenplay/interactions/navigate/second.html'),

                Navigate.back(),

                Ensure.that(Page.current().url().pathname, endsWith('/first.html')),
            ));

        it('provides a sensible description of the interaction being performed', () => {
            expect(Navigate.back().toString())
                .to.equal(`#actor navigates back in the browser history`);
        });

        it('correctly detects its invocation location', () => {
            const activity = Navigate.back();
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Navigate.spec.ts');
            expect(location.line).to.equal(61);
            expect(location.column).to.equal(39);
        });
    });

    describe('forward', () => {

        it('allows the actor to navigate forward in the browser history', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/interactions/navigate/first.html'),
                Navigate.to('/screenplay/interactions/navigate/second.html'),

                Navigate.back(),
                Navigate.forward(),

                Ensure.that(Page.current().url().pathname, endsWith('second.html')),
            ));

        it('provides a sensible description of the interaction being performed', () => {
            expect(Navigate.forward().toString())
                .to.equal(`#actor navigates forward in the browser history`);
        });

        it('correctly detects its invocation location', () => {
            const activity = Navigate.forward();
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Navigate.spec.ts');
            expect(location.line).to.equal(89);
            expect(location.column).to.equal(39);
        });
    });

    describe('reloadPage', () => {

        it('allows the actor to navigate to a desired destination', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/interactions/navigate/reloaded.html'),

                Navigate.reloadPage(),

                Ensure.that(Text.of(PageElement.located(By.id('h'))), equals('Reloaded')),
            ));

        it('provides a sensible description of the interaction being performed', () => {
            expect(Navigate.reloadPage().toString())
                .to.equal(`#actor reloads the page`);
        });

        it('correctly detects its invocation location', () => {
            const activity = Navigate.reloadPage();
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Navigate.spec.ts');
            expect(location.line).to.equal(115);
            expect(location.column).to.equal(39);
        });
    });
});
