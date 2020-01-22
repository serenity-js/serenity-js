import { expect } from '@integration/testing-tools';
import * as sinon from 'sinon';
import serenityReporterForJasmine = require('../src');

describe('@serenity-js/jasmine', () => {

    let jasmine: any;

    beforeEach(() => {
        const env = {
            beforeEach: sinon.spy(),
            afterAll: sinon.spy(),
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

                const spec = new jasmine.Spec();

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
        });

        describe('so that the Suite', () => {

            /**
             * @test {bootstrap}
             * @test {monkeyPatched}
             */
            it('defaults to an unknown location if the real one could not be determined', () => {
                // detecting the real location is done in Jasmine integration tests
                serenityReporterForJasmine(jasmine);

                const spec = new jasmine.Suite();

                expect(spec.result.location.path).to.equal('unknown');
                expect(spec.result.location.line).to.equal(0);
                expect(spec.result.location.column).to.equal(0);
            });
        });
    });
});
