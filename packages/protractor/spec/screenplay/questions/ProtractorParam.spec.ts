/* eslint-disable unicorn/prevent-abbreviations */
import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, ConfigurationError, engage } from '@serenity-js/core';
import { beforeEach, describe, it } from 'mocha';

import { ProtractorParam } from '../../../src';
import { UIActors } from '../../UIActors';

describe('ProtractorParam', () => {

    interface User {
        id: number;
        firstName: string;
        lastName: string;
    }

    beforeEach(() => engage(new UIActors()));

    it('lets the actor read the value of a primitive Protractor parameter specified in protractor.conf.js', () =>
        actorCalled('Bernie').attemptsTo(
            Ensure.that(ProtractorParam.called<string>('env'), equals('test')),
        ));

    it('lets the actor read the value of an object Protractor parameter specified in protractor.conf.js', () =>
        actorCalled('Bernie').attemptsTo(
            Ensure.that(
                ProtractorParam.called<User>('user'),
                equals({ id: 1, firstName: 'Jan', lastName: 'Molak' })
            ),
        ));

    it('lets the actor read the value of a Protractor parameter specified by path', () =>
        actorCalled('Bernie').attemptsTo(
            Ensure.that(ProtractorParam.called<string>('user.firstName'), equals('Jan')),
        ));

    it('creates a Screenplay Adapter around the Question', () =>
        actorCalled('Bernie').attemptsTo(
            Ensure.that(ProtractorParam.called<User>('user').firstName, equals('Jan')),
        ));

    it('complains if the parameter is undefined', () =>
        expect(actorCalled('Bernie').attemptsTo(
            Ensure.that(ProtractorParam.called<string>('user.address'), equals('London, UK')),
        )).to.be.rejectedWith(ConfigurationError, `Protractor param 'user.address' is undefined`));

    it('contributes to a human-readable description of an activity', () => {
        expect(Ensure.that(ProtractorParam.called<string>('user.firstName'), equals('Jan')).toString())
            .to.equal(`#actor ensures that the "user.firstName" param specified in Protractor config does equal "Jan"`)
    });
});
