import { Ensure, equals } from '@serenity-js/assertions';
import { Actor, Duration } from '@serenity-js/core';
import { by, protractor } from 'protractor';

import { BrowseTheWeb, Navigate, Target, Text, Wait } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

import { expect } from '@integration/testing-tools';

describe('Wait', () => {

    const Bernie = Actor.named('Bernie').whoCan(
        BrowseTheWeb.using(protractor.browser),
    );

    const Status = Target.the('header').located(by.id('status'));

    const Test_Page = pageFromTemplate(`
        <html>
            <body>
                <h1 id="status">Loading...</h1>
                <script>
                    (function() {
                        setTimeout(function() {
                            document.getElementById('status').textContent = 'Ready!'
                        }, 200);
                    })();
                </script>
            </body>
        </html>
    `);

    describe(`for`, () => {

        /** @test {Wait} */
        /** @test {Wait.for} */
        it(`pauses the actor flow for the length of an explicitly-set duration`, () => Bernie.attemptsTo(
            Navigate.to(Test_Page),

            Wait.for(Duration.ofMillis(300)),

            Ensure.that(Text.of(Status), equals('Ready!')),
        ));

        /** @test {Wait#toString} */
        it(`provides a sensible description of the interaction being performed`, () => {
            expect(Wait.for(Duration.ofMillis(300)).toString())
                .to.equal(`#actor waits for 300ms`);
        });
    });

    describe(`until`, () => {

        /** @test {Wait} */
        /** @test {Wait.until} */
        it(`pauses the actor flow until the expectation is met`, () => Bernie.attemptsTo(
            Navigate.to(Test_Page),

            Wait.until(Text.of(Status), equals('Ready!')),

            Ensure.that(Text.of(Status), equals('Ready!')),
        ));

        /** @test {Wait} */
        /** @test {Wait.upTo} */
        /** @test {Wait.until} */
        it('pauses the actor flow until the timeout expires', () => expect(Bernie.attemptsTo(
            Navigate.to(Test_Page),

            Wait.upTo(Duration.ofMillis(10)).until(Text.of(Status), equals('Ready!')),
        )).to.be.rejected.then(error => {
            expect(error.constructor.name).to.equal('TimeoutError');
        }));

        /** @test {Wait#toString} */
        it(`provides a sensible description of the interaction being performed`, () => {
            expect(Wait.upTo(Duration.ofMillis(10)).until(Text.of(Status), equals('Ready!')).toString())
                .to.equal(`#actor waits up to 10ms until the text of the header does equal 'Ready!'`);
        });
    });
});
