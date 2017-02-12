import { ActivityType } from '../../../../src/serenity/recording';
import { ActivityDescription } from '../../../../src/serenity/recording/activity_description';
import { Actor, PerformsTasks, Task } from '../../../../src/serenity/screenplay';

import expect = require('../../../expect');

describe('ActivityDescription', () => {

    class PayWithCreditCard implements Task {
        static number(creditCardNumber: string) {
            return new PayWithCreditCard(creditCardNumber);
        }

        expiringOn(date: string) {
            this.expiryDate = date.split('/');

            return this;
        }

        constructor(private cardNumber: string, private expiryDate?: string[]) {}

        performAs(actor: PerformsTasks): Promise<void> {
            return actor.attemptsTo(
                // interact with the application to input the data
            );
        }

        lastFourDigits() {
            return this.cardNumber.slice(-4);
        }
    }

    describe('generates a step from an activity so that the template of its name', () => {

        it('uses public methods defined on the activity', () => {
            const step = new ActivityDescription('Pays with a credit card ending "#lastFourDigits"', ActivityType.Task)
                .interpolateWith(PayWithCreditCard.number('4111 1111 1111 1234').expiringOn('2020/12'), []);

            expect(step.name).to.equal('Pays with a credit card ending "1234"');
        });

        it('uses member fields defined on the activity', () => {
            const step = new ActivityDescription('Pays with a credit number "#cardNumber"', ActivityType.Task)
                .interpolateWith(PayWithCreditCard.number('4111 1111 1111 1234').expiringOn('2020/12'), []);

            expect(step.name).to.equal('Pays with a credit number "4111 1111 1111 1234"');
        });

        it('uses lists of strings', () => {
            const step = new ActivityDescription('Pays with a credit card expiring on "#expiryDate"', ActivityType.Task)
                .interpolateWith(PayWithCreditCard.number('4111 1111 1111 1234').expiringOn('2020/12'), []);

            expect(step.name).to.equal('Pays with a credit card expiring on "2020, 12"');
        });

        it('uses arguments passed to the performAs method', () => {
            const step = new ActivityDescription('{0} pays with a credit card', ActivityType.Task)
                .interpolateWith(PayWithCreditCard.number('4111 1111 1111 1234').expiringOn('2020/12'), [Actor.named('James')]);

            expect(step.name).to.equal('James pays with a credit card');
        });

        it('ignores the fields that are not defined', () => {
            const step = new ActivityDescription('Pays with a credit card with PIN number #pinNumber', ActivityType.Task)
                .interpolateWith(PayWithCreditCard.number('4111 1111 1111 1234'), []);

            expect(step.name).to.equal('Pays with a credit card with PIN number #pinNumber');
        });
    });
});
