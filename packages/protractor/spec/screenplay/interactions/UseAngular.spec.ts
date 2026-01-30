import { expect } from '@integration/testing-tools';
import { Ensure, equals, isTrue } from '@serenity-js/assertions';
import { actorCalled, engage, Question } from '@serenity-js/core';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { protractor } from 'protractor';

import { UseAngular } from '../../../src';
import { promised } from '../../../src/screenplay/promised';
import { UIActors } from '../../UIActors';

describe('UseAngular', function () {

    beforeEach(() => engage(new UIActors()));

    describe('synchronisation', () => {

        afterEach(() => protractor.browser.waitForAngularEnabled(false));    // same as protractor.conf.js

        const IsSynchronisationEnabled = () =>
            Question.about('angular synchronisation',
                actor => promised(protractor.browser.waitForAngularEnabled()),
            );

        describe('when enabled', () => {
            beforeEach(() => promised(protractor.browser.waitForAngularEnabled(true)));

            it('can be disabled', () => actorCalled('Bernie').attemptsTo(
                UseAngular.disableSynchronisation(),
                Ensure.that(IsSynchronisationEnabled(), equals(false)),
            ));
        });

        describe('when disabled', () => {
            beforeEach(() => promised(protractor.browser.waitForAngularEnabled(false)));

            it('can be enabled', () => actorCalled('Bernie').attemptsTo(
                UseAngular.enableSynchronisation(),
                Ensure.that(IsSynchronisationEnabled(), isTrue()),
            ));
        });

        it('provides a sensible description of the interaction being performed', () => {
            expect(UseAngular.enableSynchronisation().toString())
                .to.equal(`#actor enables synchronisation with Angular`);

            expect(UseAngular.disableSynchronisation().toString())
                .to.equal(`#actor disables synchronisation with Angular`);
        });
    });
});
