import 'mocha';

import { expect } from '@integration/testing-tools';
import { TestCompromisedError } from '@serenity-js/core';
import * as sinon from 'sinon';
import serenityReporterForJasmine = require('../src');

describe('@serenity-js/jasmine', () => {

    let jasmine: any;
    let attrs: any;

    beforeEach(() => {
        const env = {
            beforeEach: sinon.spy(),
            afterAll: sinon.spy(),
        };

        attrs = {
            expectationResultFactory(fnAttrs) {
                return {};
            },
        };

        jasmine = {
            Spec: function Spec() {
                this.result = {};
            },
            Suite: function Suite() {
                this.result = {};
            },
            getEnv: () => env,
        };
    });

    describe('monkey-patches Jasmine', () => {

        describe('so that the Spec', () => {

            /**
             * @test {bootstrap}
             * @test {monkeyPatched}
             */
            it('defaults to an unknown location if the real one could not be determined', () => {
                // detecting the real location is done in Jasmine integration tests
                serenityReporterForJasmine(jasmine);

                const spec = new jasmine.Spec(attrs);

                expect(spec.result.location.path).to.equal('unknown');
                expect(spec.result.location.line).to.equal(0);
                expect(spec.result.location.column).to.equal(0);
            });

            /**
             * @test {bootstrap}
             * @test {monkeyPatched}
             */
            it('has all the static members of the original constructor function', () => {

                jasmine.Spec.pendingSpecExceptionMessage = '=> marked Pending';

                serenityReporterForJasmine(jasmine);

                expect(jasmine.Spec.pendingSpecExceptionMessage).to.equal('=> marked Pending');
            });

            /**
             * @test {bootstrap}
             * @test {monkeyPatched}
             */
            it('has all the static members of the original constructor function', () => {

                jasmine.Spec.pendingSpecExceptionMessage = '=> marked Pending';

                serenityReporterForJasmine(jasmine);

                expect(jasmine.Spec.pendingSpecExceptionMessage).to.equal('=> marked Pending');
            });

            it('correctly reports the stacktrace of an error', () => {
                const error = new TestCompromisedError('DB is down', new Error('Connection error'));

                serenityReporterForJasmine(jasmine);

                const spec_ = new jasmine.Spec(attrs);

                const result = attrs.expectationResultFactory({ passing: false, error });

                const frames = result.stack.split('\n');
                expect(frames[0]).to.equal('TestCompromisedError: DB is down');
                expect(frames).to.include('Caused by: Error: Connection error');
            });
        });

        describe('so that the Suite', () => {

            /**
             * @test {bootstrap}
             * @test {monkeyPatched}
             */
            it('defaults to an unknown location if the real one could not be determined', () => {
                // detecting the real location is done in Jasmine integration tests
                serenityReporterForJasmine(jasmine);

                const suite = new jasmine.Suite(attrs);

                expect(suite.result.location.path).to.equal('unknown');
                expect(suite.result.location.line).to.equal(0);
                expect(suite.result.location.column).to.equal(0);
            });

            it('correctly reports the stacktrace of an error', () => {
                const error = new TestCompromisedError('DB is down', new Error('Connection error'));

                serenityReporterForJasmine(jasmine);

                const suite_ = new jasmine.Suite(attrs);

                const result = attrs.expectationResultFactory({ passing: false, error });

                const frames = result.stack.split('\n');
                expect(frames[0]).to.equal('TestCompromisedError: DB is down');
                expect(frames).to.include('Caused by: Error: Connection error');
            });
        });
    });
});
