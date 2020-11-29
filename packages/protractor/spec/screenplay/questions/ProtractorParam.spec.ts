import 'mocha';
import { expect } from '@integration/testing-tools';

import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, ConfigurationError } from '@serenity-js/core';

import { ProtractorParam } from '../../../src';

describe('ProtractorParam', () => {

    /**
     * @test {ProtractorParam}
     * @test {ProtractorParam.called}
     */
    it('lets the actor read the value of a primitive Protractor parameter specified in protractor.conf.js', () =>
        actorCalled('Bernie').attemptsTo(
            Ensure.that(ProtractorParam.called<string>('env'), equals('test')),
        ));

    /**
     * @test {ProtractorParam}
     * @test {ProtractorParam.called}
     */
    it('lets the actor read the value of an object Protractor parameter specified in protractor.conf.js', () =>
        actorCalled('Bernie').attemptsTo(
            Ensure.that(
                ProtractorParam.called<{ id: number, firstName: string, lastName: string }>('user'),
                equals({ id: 1, firstName: 'Jan', lastName: 'Molak' })
            ),
        ));

    /**
     * @test {ProtractorParam}
     * @test {ProtractorParam.called}
     */
    it('lets the actor read the value of a Protractor parameter specified by path', () =>
        actorCalled('Bernie').attemptsTo(
            Ensure.that(ProtractorParam.called<string>('user.firstName'), equals('Jan')),
        ));

    /**
     * @test {ProtractorParam}
     * @test {ProtractorParam.called}
     */
    it('complains if the parameter is undefined', () =>
        expect(actorCalled('Bernie').attemptsTo(
            Ensure.that(ProtractorParam.called<string>('user.address'), equals('London, UK')),
        )).to.be.rejectedWith(ConfigurationError, 'Protractor param "user.address" is undefined'));
});
