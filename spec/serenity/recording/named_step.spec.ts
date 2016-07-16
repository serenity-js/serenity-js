import {NamedStepTemplate} from '../../../src/serenity/recording/named_step';
import {Actor, PerformsTasks} from '../../../src/serenity/screenplay/actor';
import {Task} from '../../../src/serenity/screenplay/performables';

import expect = require('../../expect');

describe('NamedStepTemplate', () => {

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

    describe('generates a step from a performable so that the template of its name', () => {

        it('uses public methods defined on the performable', () => {
            let task = PayWithCreditCard.number('4111 1111 1111 1234').expiringOn('2020/12'),
                step = new NamedStepTemplate('Pays with a credit card ending "#lastFourDigits"').interpolateWith(task, []);

            expect(step.name).to.equal('Pays with a credit card ending "1234"');
        });

        it('uses member fields defined on the performable', () => {
            let task = PayWithCreditCard.number('4111 1111 1111 1234').expiringOn('2020/12'),
                step = new NamedStepTemplate('Pays with a credit number "#cardNumber"').interpolateWith(task, []);

            expect(step.name).to.equal('Pays with a credit number "4111 1111 1111 1234"');
        });

        it('uses lists of strings', () => {
            let task = PayWithCreditCard.number('4111 1111 1111 1234').expiringOn('2020/12'),
                step = new NamedStepTemplate('Pays with a credit card expiring on "#expiryDate"').interpolateWith(task, []);

            expect(step.name).to.equal('Pays with a credit card expiring on "2020, 12"');
        });

        it('uses arguments passed to the performAs method', () => {
            let task = PayWithCreditCard.number('4111 1111 1111 1234').expiringOn('2020/12'),
                step = new NamedStepTemplate('{0} pays with a credit card').interpolateWith(task, [Actor.named('James')]);

            expect(step.name).to.equal('James pays with a credit card');
        });

        it('ignores the fields that are not defined', () => {
            let task = PayWithCreditCard.number('4111 1111 1111 1234'),
                step = new NamedStepTemplate('Pays with a credit card with PIN number #pinNumber').interpolateWith(task, []);

            expect(step.name).to.equal('Pays with a credit card with PIN number #pinNumber');
        });
    });
});
