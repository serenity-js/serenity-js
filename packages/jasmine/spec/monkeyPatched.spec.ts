import { expect } from '@integration/testing-tools';
import * as sinon from 'sinon';
import serenityReporterForJasmine = require('../src');

describe('@serenity-js/jasmine', () => {

    let jasmine: any;

    beforeEach(() => {
        const env = {
            afterEach: sinon.spy(),
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
            it('knows the location of the invoker', () => {
                serenityReporterForJasmine(jasmine);

                const spec = new jasmine.Spec();

                expect(spec.result.location.path).to.match(/monkeyPatched.spec.ts$/);
                expect(spec.result.location.line).to.equal(36);
                expect(spec.result.location.column).to.equal(30);
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
            it('knows the location of the invoker', () => {
                serenityReporterForJasmine(jasmine);

                const spec = new jasmine.Suite();

                expect(spec.result.location.path).to.match(/monkeyPatched.spec.ts$/);
                expect(spec.result.location.line).to.equal(66);
                expect(spec.result.location.column).to.equal(30);
            });
        });
    });

    /**
     * @test {bootstrap}
     * @test {monkeyPatched}
     */
    it('registers an afterEach hook to ensure Serenity/JS is synchronised with Jasmine', () => {
        serenityReporterForJasmine(jasmine);

        expect(jasmine.getEnv().afterEach).to.have.been.calledOnce; // tslint:disable-line:no-unused-expression
    });
});
