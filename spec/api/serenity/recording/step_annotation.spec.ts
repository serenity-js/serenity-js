import { Journal, StageManager } from '../../../../src/serenity/stage';

import { Actor, aTask, PerformsTasks, Task } from '../../../../src/screenplay';

import expect = require('../../../expect');
import { Activity, ActivityFinished, ActivityStarts, Outcome, Result } from '../../../../src/serenity/domain';
import { createStepDecorator } from '../../../../src/serenity/recording';

describe('Notifiers', () => {

    const stageManager = new StageManager(new Journal()),
          bruce        = Actor.named('Bruce'),
          step         = createStepDecorator(stageManager);

    describe('@step', () => {

        describe('When an annotated Task or Interaction is performed by the Actor', () => {

            describe('When all goes well', () => {

                class PayWithCreditCard implements Task {
                    static number(creditCardNumber: string) {
                        return new PayWithCreditCard(creditCardNumber);
                    }

                    constructor(private cardNumber: string) {}

                    @step('{0} pays with a credit card number #cardNumber')
                    performAs(actor: PerformsTasks): PromiseLike<void> {
                        return actor.attemptsTo( /*...*/ );
                    }
                }

                it('Notifies the Stage Manager when the Activity starts', () => {

                    return bruce.attemptsTo(PayWithCreditCard.number('4111 1111 1111 1111')).then(() => {

                        let newJournalEntries = stageManager.readNewJournalEntriesAs('unit-test');

                        expect(newJournalEntries).to.have.lengthOf(2);

                        expect(newJournalEntries[ 0 ]).to.be.instanceOf(ActivityStarts);
                        expect(newJournalEntries[ 0 ].value).to.be.instanceOf(Activity);
                        expect(newJournalEntries[ 0 ].value.name).to.equal('Bruce pays with a credit card number 4111 1111 1111 1111');
                    });
                });

                it('Notifies the Stage Manager when the Activity finishes successfully', () => {

                    return bruce.attemptsTo(PayWithCreditCard.number('4111 1111 1111 1111')).then(() => {

                        let newJournalEntries = stageManager.readNewJournalEntriesAs('unit-test');

                        expect(newJournalEntries).to.have.lengthOf(2);

                        expect(newJournalEntries[ 1 ]).to.be.instanceOf(ActivityFinished);
                        expect(newJournalEntries[ 1 ].value).to.be.instanceOf(Outcome);

                        expect(newJournalEntries[ 1 ].value.subject).to.be.instanceOf(Activity);
                        expect(newJournalEntries[ 1 ].value.subject.name).to.equal('Bruce pays with a credit card number 4111 1111 1111 1111');
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

                            let lastEntry = stageManager.readNewJournalEntriesAs('unit-test').pop();

                            expect(lastEntry.value.error.message).to.equal('Payment failed');
                            expect(lastEntry.value.result).to.equal(Result.ERROR);
                        }));

                it('Notifies the Stage Manager when the Activity fails', () =>

                    expect(bruce.attemptsTo(PayWithInvalidCreditCardThrowingAnAssertionError.number('1234 1234 1234 1234'))).
                    to.be.rejected.then(() => {

                        let lastEntry = stageManager.readNewJournalEntriesAs('unit-test').pop();

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

                            const lastEntry = stageManager.readNewJournalEntriesAs('unit-test').pop();

                            expect(lastEntry.value.error.message).to.equal('Payment failed');
                            expect(lastEntry.value.result).to.equal(Result.ERROR);
                        }));
            });
        });

        describe('When an annotated FunctionalTask or FunctionalInteraction is performed by the Actor', () => {

            describe('When all goes well', () => {

                const PayWithCreditCard = {
                    number: (creditCardNumber: string) => aTask()
                        .where(`{0} pays with a credit card number ${creditCardNumber}`)
                        .whichReportsTo(stageManager),
                };

                it('Notifies the Stage Manager when the Activity starts', () => {

                    return bruce.attemptsTo(PayWithCreditCard.number('4111 1111 1111 1111')).then(() => {

                        const newJournalEntries = stageManager.readNewJournalEntriesAs('unit-test');

                        expect(newJournalEntries).to.have.lengthOf(2);

                        expect(newJournalEntries[ 0 ]).to.be.instanceOf(ActivityStarts);
                        expect(newJournalEntries[ 0 ].value).to.be.instanceOf(Activity);
                        expect(newJournalEntries[ 0 ].value.name).to.equal('Bruce pays with a credit card number 4111 1111 1111 1111');
                    });
                });

                it('Notifies the Stage Manager when the Activity finishes successfully', () => {

                    return bruce.attemptsTo(PayWithCreditCard.number('4111 1111 1111 1111')).then(() => {

                        const newJournalEntries = stageManager.readNewJournalEntriesAs('unit-test');

                        expect(newJournalEntries).to.have.lengthOf(2);

                        expect(newJournalEntries[ 1 ]).to.be.instanceOf(ActivityFinished);
                        expect(newJournalEntries[ 1 ].value).to.be.instanceOf(Outcome);

                        expect(newJournalEntries[ 1 ].value.subject).to.be.instanceOf(Activity);
                        expect(newJournalEntries[ 1 ].value.subject.name).to.equal('Bruce pays with a credit card number 4111 1111 1111 1111');
                    });
                });
            });

            describe('When things go wrong and the Activity throws an Error', () => {

                const PayWithInvalidCreditCardThrowingAnError = {
                    number(creditCardNumber: string) {
                        return aTask((actor: PerformsTasks) => { throw new Error('Payment failed'); })
                            .where(`{0} pays with an invalid credit card number ${creditCardNumber}`)
                            .whichReportsTo(stageManager);
                    },
                };

                const PayWithInvalidCreditCardThrowingAnAssertionError = {
                    number(creditCardNumber: string) {
                        return aTask((actor: PerformsTasks) => expect(Promise.resolve(false)).to.eventually.equal(true))
                            .where(`{0} pays with an invalid credit card number ${creditCardNumber}`)
                            .whichReportsTo(stageManager);
                    },
                };

                it('Notifies the Stage Manager when the Activity throws an Error', () =>

                    expect(bruce.attemptsTo(PayWithInvalidCreditCardThrowingAnError.number('1234 1234 1234 1234'))                    ).
                        to.be.rejected.then(() => {

                            const lastEntry = stageManager.readNewJournalEntriesAs('unit-test').pop();

                            expect(lastEntry.value.error.message).to.equal('Payment failed');
                            expect(lastEntry.value.result).to.equal(Result.ERROR);
                        }));

                it('Notifies the Stage Manager when the Activity fails', () =>

                    expect(bruce.attemptsTo(PayWithInvalidCreditCardThrowingAnAssertionError.number('1234 1234 1234 1234'))).
                    to.be.rejected.then(() => {

                        const lastEntry = stageManager.readNewJournalEntriesAs('unit-test').pop();

                        expect(lastEntry.value.error.message).to.equal('expected false to equal true');
                        expect(Result[lastEntry.value.result]).to.equal(Result[Result.FAILURE]);
                    }));
            });

            describe('When things go wrong and the Activity throws an Error', () => {

                const PayWithInvalidCreditCardRejectingAPromise = {
                    number(creditCardNumber: string) {
                        return aTask((actor: PerformsTasks) => Promise.reject(new Error('Payment failed')))
                            .where(`{0} pays with an invalid credit card number ${creditCardNumber}`)
                            .whichReportsTo(stageManager);
                    },
                };

                it('Notifies the Stage Manager when the Activity fails due to a promise being rejected', () =>

                    expect(bruce.attemptsTo(PayWithInvalidCreditCardRejectingAPromise.number('1234 1234 1234 1234'))).
                        to.be.rejected.then(() => {

                            const lastEntry = stageManager.readNewJournalEntriesAs('unit-test').pop();

                            expect(lastEntry.value.error.message).to.equal('Payment failed');
                            expect(lastEntry.value.result).to.equal(Result.ERROR);
                        }));
            });
        });

    });
});
