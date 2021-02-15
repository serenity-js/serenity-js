import 'mocha';
import { expect } from '@integration/testing-tools';
import { actorCalled, Interaction } from '@serenity-js/core';
import * as sinon from 'sinon';

import { Check, equals, startsWith } from '../src';
import { isIdenticalTo } from './fixtures';

/** @test {Check} */
describe('Check', () => {

    const Call = (fn: () => void) => Interaction.where(`#actor calls a function`, actor => fn());

    let spy: sinon.SinonSpy;
    beforeEach(() => spy = sinon.spy());

    describe('(if branch)', () => {

        /** @test {Check.whether} */
        /** @test {Check#andIfSo} */
        it('makes the actor execute the activities when the expectation is met', () =>
            expect(actorCalled('Enrique').attemptsTo(
                Check.whether('Hello World', startsWith('Hello'))
                    .andIfSo(
                        Call(() => spy(true)),
                        Call(() => spy(true)),
                    ),
            )).to.be.fulfilled.
            then(() => {
                expect(spy).to.have.been.calledWith(true).callCount(2);
            }),
        );

        /** @test {Check.whether} */
        /** @test {Check#andIfSo} */
        it('makes the actor ignore the activities when the expectation is not met', () =>
            expect(actorCalled('Enrique').attemptsTo(
                Check.whether('Hello World', startsWith('¡Hola'))
                    .andIfSo(
                        Call(() => spy(true)),
                    ),
            )).to.be.fulfilled.
            then(() => {
                expect(spy).to.not.have.been.called;    // tslint:disable-line:no-unused-expression
            }),
        );
    });

    describe('(if/else branches)', () => {
        /** @test {Check.whether} */
        /** @test {Check#andIfSo} */
        /** @test {Check#otherwise} */
        it('makes the actor execute the activities when the expectation is met', () =>
            expect(actorCalled('Enrique').attemptsTo(
                Check.whether('Hello World', startsWith('Hello'))
                    .andIfSo(
                        Call(() => spy(true)),
                    )
                    .otherwise(
                        Call(() => spy(false)),
                    ),
            )).to.be.fulfilled.
            then(() => {
                expect(spy).to.have.been.calledWith(true).callCount(1);
            }),
        );

        /** @test {Check.whether} */
        /** @test {Check#andIfSo} */
        /** @test {Check#otherwise} */
        it('makes the actor execute the alternative activities when the expectation is not met', () =>
            expect(actorCalled('Enrique').attemptsTo(
                Check.whether('Hello World', startsWith('¡Hola'))
                    .andIfSo(
                        Call(() => spy(true)),
                    )
                    .otherwise(
                        Call(() => spy(false)),
                    ),
            )).to.be.fulfilled.
            then(() => {
                expect(spy).to.have.been.calledWith(false).callCount(1);
            }),
        );
    });

    describe('reporting', () => {

        /** @test {Check.whether} */
        /** @test {Check#whether} */
        it('provides a description of the check', () => {
            expect(Check.whether(4, isIdenticalTo(7)).andIfSo().toString()).to.equal(`#actor checks whether 4 does have value identical to 7`);
        });

        /** @test {Check.whether} */
        /** @test {Check#whether} */
        it('provides a description of the check when the user provide a specific description by using describedAs method', () => {
            const description = "#actor checks whether 4 summed with 1 is 5"
            expect(Check.whether(4 + 1, isIdenticalTo(5)).andIfSo().describedAs(description).toString()).to.equal(description);
        });

        /** @test {Check.whether} */
        /** @test {Check#whether} */
        it('provides a description of the check while correctly cleaning the output from new line characters', () => {
            expect(Check.whether({ person: { name: 'Jan' }}, equals({
                person: {
                    name: 'Jan',
                },
            })).andIfSo().toString()).to.equal(`#actor checks whether { "person": { "name": "Jan" } } does equal { "person": { "name": "Jan" } }`);
        });
    })
});
