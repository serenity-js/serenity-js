import 'mocha';
import { expect } from '@integration/testing-tools';
import { Ensure, isTrue } from '@serenity-js/assertions';
import { Actor, actorCalled, actorInTheSpotlight, Cast, ConfigurationError, configure, Discardable, engage, Extension, Interaction, Question } from '@serenity-js/core';
import { protractor, ProtractorBrowser } from 'protractor';
import { BrowseTheWeb } from '../../../src';

describe('BrowseTheWeb', () => {

    class TroubleMaker implements Extension<ProtractorBrowser> {
        applyTo(subject: ProtractorBrowser): ProtractorBrowser | Promise<ProtractorBrowser> {
            return subject;
        }

        someMethod(): void {
            return void 0;
        }
    }

    describe('when extended', () => {

        class SupportForAngularEnabled implements Discardable, Extension<ProtractorBrowser>{
            private browser: ProtractorBrowser;

            applyTo(subject: ProtractorBrowser): ProtractorBrowser | Promise<ProtractorBrowser> {
                this.browser = subject;

                return Promise.resolve()
                    .then(() => subject.waitForAngularEnabled(true))
                    .then(() => this.browser);
            }

            synchronisationEnabled(): boolean {
                return ! this.browser.ignoreSynchronization;
            }

            discard(): Promise<void> {
                return Promise.resolve()
                    .then(() => {
                        this.browser.waitForAngularEnabled(false)
                    })
            }
        }

        class Actors implements Cast {
            prepare(actor: Actor): Actor {
                return actor.whoCan(BrowseTheWeb.using(protractor.browser).extendedWith(new SupportForAngularEnabled()));
            }
        }

        const AngularSupportEnabled = () =>
            Question.about('Protractor ignoreSynchronization setting', actor =>
                BrowseTheWeb.as(actor).extension(SupportForAngularEnabled).synchronisationEnabled()
            );

        const CauseTrouble = () =>
            Interaction.where(`#actor tries to use an extension that hasn't been provided`, actor => {
                BrowseTheWeb.as(actor).extension(TroubleMaker).someMethod()
            });

        beforeEach(() => engage(new Actors()));

        /** @test {BrowseTheWeb} */
        /** @test {BrowseTheWeb#with} */
        it('initialises the extensions correctly', () =>
            actorCalled('Bernie').attemptsTo(
                Ensure.that(AngularSupportEnabled(), isTrue())
            ));

        /** @test {BrowseTheWeb} */
        /** @test {BrowseTheWeb#with} */
        it('complains if the extension is not available', () =>
            expect(actorCalled('Bernie').attemptsTo(
                CauseTrouble(),
            )).to.be.rejectedWith(ConfigurationError, `BrowseTheWeb doesn't have the TroubleMaker extension`));

        // Note that you don't have to manually dismiss the actors in your tests
        // as Serenity/JS will do this for you.
        //
        // In the case of this scenario, however, I have to dismiss them explicitly
        // because it's executed via plain Mocha rather than
        // the Serenity/JS runner.
        afterEach(() =>
            actorCalled('Bernie').dismiss()
        );
    });

    /** @test {BrowseTheWeb} */
    /** @test {BrowseTheWeb#with} */
    it('complains if the extension is registered more than once', () => {
        expect(() => {
            BrowseTheWeb.using(protractor.browser)
                .extendedWith(new TroubleMaker())
                .extendedWith(new TroubleMaker())
        }).to.throw(ConfigurationError, `BrowseTheWeb already has the TroubleMaker extension, so you don't need to assign it again`);
    });
});
