import sinon = require('sinon');
import expect = require('../../../expect');
import {
    Actor,
    Notepad,
    Question,
    TakeNote,
    TakeNotes,
    UsesAbilities,
} from '../../../../src/serenity/screenplay';
import { Performable } from '../../../../src/serenity/screenplay/performables';

import { step } from '../../../../src/serenity/recording/step_annotation';

import { AnswersQuestions } from '../../../../src/serenity/screenplay/actor';
import { Expectation } from '../../../../src/serenity/screenplay/expectations';
import { OneOrMany } from '../../../../src/serenity/screenplay/lists';

describe('Abilities', () => {

    describe('TakeNotes', () => {

        let notepad: Notepad;

        const include      = (expected: string)   => (actual: string[]) => expect(actual).to.eventually.include(expected),
              includeAllOf = (expected: string[]) => (actual: string[]) => expect(actual).to.eventually.include.members(expected),
              equals       = <T>(expected: T)     => (actual: T)        => expect(actual).to.eventually.equal(expected);

        beforeEach(() => notepad = {});

        it ('stores notes in a notepad as promises to be resolved', () => {
            let displayedVoucher = MyVoucherCode.shownAs('SUMMER2017');

            let actor = Actor.named('Benjamin').whoCan(TakeNotes.using(notepad));

            return actor.attemptsTo(
                TakeNote.of(displayedVoucher).as('my voucher'),
            ).
            then(() => notepad['my voucher']).
            then(voucher => expect(voucher).to.equal('SUMMER2017'));
        });

        it('stores notes using a topic name derived from the question', () => {
            let displayedVoucher = MyVoucherCode.shownAs('SUMMER2017'),
                availableVoucher = AvailableVoucher.of('SUMMER2017');

            let actor = Actor.named('Benjamin').whoCan(TakeNotes.usingAnEmptyNotepad());

            return actor.attemptsTo(
                TakeNote.of(displayedVoucher),
                CompareNotes.toSeeIf(availableVoucher, equals, displayedVoucher),
            );
        });

        it ('allows the Actor to remember a thing they\'ve seen', () => {
            let displayedVoucher = MyVoucherCode.shownAs('SUMMER2017'),
                availableVoucher = AvailableVoucher.of('SUMMER2017');

            let actor = Actor.named('Benjamin').whoCan(TakeNotes.using(notepad));

            return actor.attemptsTo(
                TakeNote.of(displayedVoucher),
                /* perform some other tasks */
                CompareNotes.toSeeIf(availableVoucher, equals, displayedVoucher),
            );
        });

        it ('allows the Actor to remember several things they\'ve seen one after another', () => {
            let displayedVoucher = MyVoucherCode.shownAs('SUMMER2017'),
                otherDisplayedVoucher = MyVoucherCode.shownAs('50_OFF'),
                availableVouchers = AvailableVouchers.of('SUMMER2017', '50_OFF');

            let actor = Actor.named('Benjamin').whoCan(TakeNotes.using(notepad));

            return actor.attemptsTo(
                TakeNote.of(displayedVoucher).as('my voucher'),
                /* some other tasks */
                TakeNote.of(otherDisplayedVoucher).as('my other voucher'),
                /* some other tasks */
                CompareNotes.toSeeIf(availableVouchers, include, 'my voucher'),
                /* some other tasks */
                CompareNotes.toSeeIf(availableVouchers, include, 'my other voucher'),
            );
        });

        it ('allows the Actor to remember several things they\'ve seen at once', () => {
            let displayedVouchers = MyVoucherCodes.shownAs('SUMMER2017', 'SPRINGCLEANING'),
                availableVouchers = AvailableVouchers.of('SUMMER2017', '50_OFF', 'SPRINGCLEANING');

            let actor = Actor.named('Benjamin').whoCan(TakeNotes.using(notepad));

            return actor.attemptsTo(
                TakeNote.of(displayedVouchers).as('my vouchers'),
                CompareNotes.toSeeIf(availableVouchers, includeAllOf, 'my vouchers'),
            );
        });

        it ('allows the Actor to complain if you ask them about the thing they have no notes on', () => {
            let availableVouchers = AvailableVouchers.of('SUMMER2017', '5OFF', 'SPRINGCLEANING');

            let actor = Actor.named('Benjamin').whoCan(TakeNotes.using(notepad));

            return expect(actor.attemptsTo(
                CompareNotes.toSeeIf(availableVouchers, include, 'my voucher'),
            )).to.be.rejectedWith('I don\'t have any notes on the topic of "my voucher"');
        });
    });
});

export class CompareNotes<S> implements Performable {
    static toSeeIf<A>(actual: Question<OneOrMany<A>>, expectation: Expectation<OneOrMany<A>>, topic: { toString: () => string }) {
        return new CompareNotes<A>(actual, expectation, topic.toString());
    }

    @step('{0} compares notes on #actual')
    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return TakeNotes.
            as(actor).
            read(this.topic).
            then(expected => this.expect(expected)(actor.toSee(this.actual)));
    }

    constructor(private actual: Question<OneOrMany<S>>, private expect: Expectation<OneOrMany<S>>, private topic: string) {
    }
}

class MyVoucherCode implements Question<string> {
    static shownAs = (someValue: string) => new MyVoucherCode(someValue);
    answeredBy = (actor: UsesAbilities) => Promise.resolve(this.value);
    toString = () => 'My voucher code';
    constructor(private value: string) {
    }
}

class MyVoucherCodes implements Question<string[]> {
    static shownAs = (...someValues: string[]) => new MyVoucherCodes(someValues);
    answeredBy = (actor: UsesAbilities) => Promise.resolve(this.values);
    toString = () => 'My voucher codes';
    constructor(private values: string[]) {
    }
}

class AvailableVoucher implements Question<string> {
    static of = (someValue: string) => new AvailableVoucher(someValue);
    answeredBy = (actor: UsesAbilities) => Promise.resolve(this.value);
    toString = () => 'Available voucher';
    constructor(private value: string) {
    }
}

class AvailableVouchers implements Question<string[]> {
    static of = (...someValues: string[]) => new AvailableVouchers(someValues);
    answeredBy = (actor: UsesAbilities) => Promise.resolve(this.values);
    toString = () => 'Available vouchers';
    constructor(private values: string[]) {
    }
}
