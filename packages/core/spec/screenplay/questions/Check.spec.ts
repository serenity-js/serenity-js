
import { beforeEach, describe, it } from 'mocha';
import * as sinon from 'sinon';

import type { Actor} from '../../../src';
import { actorCalled, Check, Interaction } from '../../../src';
import { expect } from '../../expect';
import { isIdenticalTo } from '../../isIdenticalTo';

describe('Check', () => {

    const Call = (fn: () => void) =>
        Interaction.where(`#actor calls a function`, actor => fn());

    let spy: sinon.SinonSpy;
    let actor: Actor;

    beforeEach(() => {
        spy = sinon.spy();
        actor = actorCalled('Enrique');
    });

    afterEach(async () => {
        await actor.dismiss()
    });

    describe('(if branch)', () => {

        it('makes the actor execute the activities when the expectation is met', () =>
            expect(actor.attemptsTo(
                Check.whether('Hello World', isIdenticalTo('Hello World'))
                    .andIfSo(
                        Call(() => spy(true)),
                        Call(() => spy(true)),
                    ),
            )).to.be.fulfilled.
            then(() => {
                expect(spy).to.have.been.calledWith(true).callCount(2);
            }),
        );

        it('makes the actor ignore the activities when the expectation is not met', () =>
            expect(actor.attemptsTo(
                Check.whether('Hello World', isIdenticalTo('¡Hola'))
                    .andIfSo(
                        Call(() => spy(true)),
                    ),
            )).to.be.fulfilled.
            then(() => {
                expect(spy).to.not.have.been.called;
            }),
        );

        it('correctly detects its invocation location', () => {
            const activity = Check.whether('Hello World', isIdenticalTo('¡Hola')).andIfSo();
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Check.spec.ts');
            expect(location.line).to.equal(55);
            expect(location.column).to.equal(83);
        });
    });

    describe('(if/else branches)', () => {

        it('makes the actor execute the activities when the expectation is met', () =>
            expect(actor.attemptsTo(
                Check.whether('Hello World', isIdenticalTo('Hello World'))
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

        it('makes the actor execute the alternative activities when the expectation is not met', () =>
            expect(actor.attemptsTo(
                Check.whether('Hello World', isIdenticalTo('¡Hola'))
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

        it('correctly detects its invocation location', () => {
            const activity = Check.whether('Hello World', isIdenticalTo('¡Hola')).andIfSo().otherwise();
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('Check.spec.ts');
            expect(location.line).to.equal(97);
            expect(location.column).to.equal(93);
        });
    });

    describe('reporting', () => {

        it('provides a description of the check', () => {
            expect(Check.whether(4, isIdenticalTo(7)).andIfSo().toString()).to.equal(`#actor checks whether 4 does have value identical to 7`);
        });

        it('provides a description of the check while correctly cleaning the output from new line characters', () => {
            expect(Check.whether({ person: { name: 'Jan' }}, isIdenticalTo({
                person: {
                    name: 'Jan',
                },
            })).andIfSo().toString()).to.equal(`#actor checks whether {"person":{"name":"Jan"}} does have value identical to {"person":{"name":"Jan"}}`);
        });
    })
});
