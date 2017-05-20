import { Task } from '../../src/screenplay/activities';
import { Actor, PerformsTasks } from '../../src/screenplay/actor';
import { Journal, StageManager } from '../../src/stage';

import { ActivityFinished, ActivityStarts, Outcome, RecordedActivity, Result } from '../../src/domain';
import { step } from '../../src/recording/step_annotation';

import expect = require('../expect');

import StackTrace = require('stacktrace-js');

describe('Notifiers', () => {

    const
        stage_manager = new StageManager(new Journal()),
        bruce         = new Actor('Bruce', stage_manager);

    describe('@step', () => {

        describe('When an annotated Task or Interaction is performed by the Actor', () => {

            describe('When all goes well', () => {

                class PayWithCreditCard implements Task {
                    static number(creditCardNumber: string) {
                        return new PayWithCreditCard(creditCardNumber);
                    }

                    constructor(private cardNumber: string) {
                    }

                    @step('{0} pays with a credit card number #cardNumber')
                    performAs(actor: PerformsTasks): PromiseLike<void> {
                        return actor.attemptsTo( /*...*/ );
                    }
                }

                it('Notifies the Stage Manager when the Activity starts', () => {

                    return bruce.attemptsTo(PayWithCreditCard.number('4111 1111 1111 1111')).then(() => {

                        const newJournalEntries = stage_manager.readNewJournalEntriesAs('unit-test');

                        expect(newJournalEntries).to.have.lengthOf(2);

                        expect(newJournalEntries[ 0 ]).to.be.instanceOf(ActivityStarts);
                        expect(newJournalEntries[ 0 ].value).to.be.instanceOf(RecordedActivity);
                        expect(newJournalEntries[ 0 ].value.name).to.equal('Bruce pays with a credit card number 4111 1111 1111 1111');
                    });
                });

                it('Notifies the Stage Manager when the Activity finishes successfully', () => {

                    return bruce.attemptsTo(PayWithCreditCard.number('4111 1111 1111 1111')).then(() => {

                        const newJournalEntries = stage_manager.readNewJournalEntriesAs('unit-test');

                        expect(newJournalEntries).to.have.lengthOf(2);

                        expect(newJournalEntries[ 1 ]).to.be.instanceOf(ActivityFinished);
                        expect(newJournalEntries[ 1 ].value).to.be.instanceOf(Outcome);

                        expect(newJournalEntries[ 1 ].value.subject).to.be.instanceOf(RecordedActivity);
                        expect(newJournalEntries[ 1 ].value.subject.name).to.equal('Bruce pays with a credit card number 4111 1111 1111 1111');
                    });
                });

                it('Knows its location to enable debugging and IDE support', () => {
                    return bruce.attemptsTo(
                        PayWithCreditCard.number('4111 1111 1111 1111'),
                    ).then(() => {

                        const [ start, finish ] = stage_manager.readNewJournalEntriesAs('unit-test');

                        expect(start.value).to.be.recorded.calledAt({
                            path: '/step_annotation.spec.ts',
                            line: 69,
                            column: 34,
                        });
                    });
                });
            });

            describe('When things go wrong and the Activity throws an Error', () => {

                class PayWithInvalidCreditCardThrowingAnError implements Task {
                    static number(creditCardNumber: string) {
                        return new PayWithInvalidCreditCardThrowingAnError(creditCardNumber);
                    }

                    constructor(private cardNumber: string) {}

                    @step('{0} pays with an invalid credit card number #cardNumber')
                    performAs(actor: PerformsTasks): PromiseLike<void> {
                        throw new Error('Payment failed');
                    }
                }

                class PayWithInvalidCreditCardThrowingAnAssertionError implements Task {
                    static number(creditCardNumber: string) {
                        return new PayWithInvalidCreditCardThrowingAnAssertionError(creditCardNumber);
                    }

                    constructor(private cardNumber: string) {}

                    @step('{0} pays with an invalid credit card number #cardNumber')
                    performAs(actor: PerformsTasks): PromiseLike<void> {
                        return expect(Promise.resolve(false)).to.eventually.equal(true);
                    }
                }

                it('Notifies the Stage Manager when the Activity throws an Error', () =>

                    expect(bruce.attemptsTo(PayWithInvalidCreditCardThrowingAnError.number('1234 1234 1234 1234'))                    ).
                        to.be.rejected.then(() => {

                            const lastEntry = stage_manager.readNewJournalEntriesAs('unit-test').pop();

                            expect(lastEntry.value.error.message).to.equal('Payment failed');
                            expect(lastEntry.value.result).to.equal(Result.ERROR);
                        }));

                it('Notifies the Stage Manager when the Activity fails', () =>

                    expect(bruce.attemptsTo(PayWithInvalidCreditCardThrowingAnAssertionError.number('1234 1234 1234 1234'))).
                        to.be.rejected.then(() => {

                            const lastEntry = stage_manager.readNewJournalEntriesAs('unit-test').pop();

                            expect(lastEntry.value.error.message).to.equal('expected false to equal true');
                            expect(Result[lastEntry.value.result]).to.equal(Result[Result.FAILURE]);
                        }));
            });

            describe('When things go wrong and the Activity throws an Error', () => {

                class PayWithInvalidCreditCardRejectingAPromise implements Task {
                    static number(creditCardNumber: string) {
                        return new PayWithInvalidCreditCardRejectingAPromise(creditCardNumber);
                    }

                    constructor(private cardNumber: string) {
                    }

                    @step('{0} pays with an invalid credit card number #cardNumber')
                    performAs(actor: PerformsTasks): PromiseLike<void> {
                        return Promise.reject(new Error('Payment failed'));
                    }
                }

                it('Notifies the Stage Manager when the Activity fails due to a promise being rejected', () =>

                    expect(bruce.attemptsTo(PayWithInvalidCreditCardRejectingAPromise.number('1234 1234 1234 1234'))).
                        to.be.rejected.then(() => {

                            const lastEntry = stage_manager.readNewJournalEntriesAs('unit-test').pop();

                            expect(lastEntry.value.error.message).to.equal('Payment failed');
                            expect(lastEntry.value.result).to.equal(Result.ERROR);
                        }));
            });

            describe('Automatic migration from @step to toString()', () => {

                class AnnotatedTask implements Task {
                    private style = 'annotated';

                    @step('{0} performs an #style task')
                    performAs(actor: PerformsTasks): PromiseLike<void> {
                        return actor.attemptsTo(/* perform some tasks */);
                    }
                }

                it ('adds a toString() method to the task if it is not present', () => {

                    const task = new AnnotatedTask();

                    return expect(bruce.attemptsTo(task)).to.be.fulfilled.then(() => {

                        expect(task.toString()).to.equal('{0} performs an annotated task');
                    });
                });
            });
        });

    });
});
