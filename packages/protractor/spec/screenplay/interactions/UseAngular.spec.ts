import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals, isTrue } from '@serenity-js/assertions';
import { actorCalled, Question } from '@serenity-js/core';

import { protractor } from 'protractor';
import { UseAngular } from '../../../src';
import { promiseOf } from '../../../src/promiseOf';

describe('UseAngular', function () {

    describe('synchronisation', () => {

        afterEach(() => protractor.browser.waitForAngularEnabled(false));    // same as protractor.conf.js

        const IsSynchronisationEnabled = () => Question.about('angular synchronisation',
                actor => promiseOf(protractor.browser.waitForAngularEnabled()),
        );

        describe('when enabled', () => {
            beforeEach(() => promiseOf(protractor.browser.waitForAngularEnabled(true)));

            /** @test {UseAngular} */
            it('can be disabled', () => actorCalled('Bernie').attemptsTo(
                UseAngular.disableSynchronisation(),
                Ensure.that(IsSynchronisationEnabled(), equals(false)),
            ));
        });

        describe('when disabled', () => {
            beforeEach(() => promiseOf(protractor.browser.waitForAngularEnabled(false)));

            /** @test {UseAngular} */
            it('can be enabled', () => actorCalled('Bernie').attemptsTo(
                UseAngular.enableSynchronisation(),
                Ensure.that(IsSynchronisationEnabled(), isTrue()),
            ));
        });

        /** @test {UseAngular} */
        it('provides a sensible description of the interaction being performed', () => {
            expect(UseAngular.enableSynchronisation().toString())
                .to.equal(`#actor enables synchronisation with Angular`);

            expect(UseAngular.disableSynchronisation().toString())
                .to.equal(`#actor disables synchronisation with Angular`);
        });
    });
});
