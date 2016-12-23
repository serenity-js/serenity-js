import { Actor, PerformsTasks } from '../../../../src/serenity/screenplay/actor';
import { Performable, Task } from '../../../../src/serenity/screenplay/performables';
import { Journal, StageManager } from '../../../../src/serenity/stage';

import { Step, StepAnnotation } from '../../../../src/serenity/recording/step_annotation';

import expect = require('../../../expect');
import { ActivityFinished, ActivityStarts } from '../../../../src/serenity/domain/events';
import { Activity, Outcome, Result } from '../../../../src/serenity/domain/model';

describe('Notifiers', () => {

    let stageManager = new StageManager(new Journal()),
        bruce        = Actor.named('Bruce');

    // todo: once the Step factory comes from a DI we can test the actual annotation
    function step<T extends Performable>(stepDescriptionTemplate: string): StepAnnotation<T> {
        return new Step(stageManager).describedUsing(stepDescriptionTemplate);
    }

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

                it('Notifies the Stage Manager when the Activity fails', () => {

                    return bruce.attemptsTo(PayWithInvalidCreditCardThrowingAnError.number('1234 1234 1234 1234')).then(() => {

                        let lastEntry = stageManager.readNewJournalEntriesAs('unit-test').pop();

                        expect(lastEntry.value.error.message).to.equal('Payment failed');
                        expect(lastEntry.value.result).to.equal(Result.ERROR);
                    });
                });
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

                it('Notifies the Stage Manager when the Activity fails due to a promise being rejected', () => {

                    return bruce.attemptsTo(PayWithInvalidCreditCardRejectingAPromise.number('1234 1234 1234 1234')).then(() => {

                        let lastEntry = stageManager.readNewJournalEntriesAs('unit-test').pop();

                        expect(lastEntry.value.error.message).to.equal('Payment failed');
                        expect(lastEntry.value.result).to.equal(Result.ERROR);
                    });
                });
            });
        });

    });
});
