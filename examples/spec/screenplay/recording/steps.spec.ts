import * as chai from "chai";
import {Task} from "../../../../src/screenplay/pattern/performables";
import {PerformsTasks, Actor} from "../../../../src/screenplay/pattern/actor";
import {InterpolatedStep} from "../../../../src/screenplay/recording/steps";

const expect = chai.expect;

chai.use(require("sinon-chai"));

describe('InterpolatedStep', () => {

    class PayWithCreditCard implements Task {
        static number(creditCardNumber: string) {
            return new PayWithCreditCard(creditCardNumber);
        }

        expiringOn(date: string) {
            this.expiryDate = date;

            return this;
        }

        constructor(private cardNumber: string, private expiryDate?: string) {}

        performAs(actor: PerformsTasks) {
            actor.attemptsTo(
                // interact with the application to input the data
            );
        }

        lastFourDigits() {
            return this.cardNumber.slice(-4);
        }
    }

    describe("the step name can be generated so that", () => {

        it('uses public methods defined on the performable', () => {
            let task = PayWithCreditCard.number('4111 1111 1111 1234').expiringOn('2020/12'),
                step = new InterpolatedStep('Pays with a credit card ending "#lastFourDigits"').from(task, []);

            expect(step.name).to.equal('Pays with a credit card ending "1234"');
        });

        it('uses member fields defined on the performable', () => {
            let task = PayWithCreditCard.number('4111 1111 1111 1234').expiringOn('2020/12'),
                step = new InterpolatedStep('Pays with a credit number "#cardNumber"').from(task, []);

            expect(step.name).to.equal('Pays with a credit number "4111 1111 1111 1234"');
        });

        it('uses arguments passed to the performAs method', () => {
            let task = PayWithCreditCard.number('4111 1111 1111 1234').expiringOn('2020/12'),
                step = new InterpolatedStep('{0} pays with a credit card').from(task, [Actor.named('James')]);

            expect(step.name).to.equal('James pays with a credit card');
        });

        it('ignores the fields that are not defined', () => {
            let task = PayWithCreditCard.number('4111 1111 1111 1234'),
                step = new InterpolatedStep('Pays with a credit card expiring on #expiryDate').from(task, []);

            expect(step.name).to.equal('Pays with a credit card expiring on #expiryDate');
        });
    });
});