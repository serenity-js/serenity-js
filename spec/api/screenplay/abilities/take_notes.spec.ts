import sinon = require('sinon');
import expect = require('../../../expect');
import { Actor, Notepad, Question, TakeNote, TakeNotes, UsesAbilities } from '../../../../src/serenity/screenplay';
import { CompareNotes } from '../../../../src/serenity/screenplay/interactions/compare_notes';

describe('Abilities', () => {

    describe('TakeNotes', () => {

        let notepad: Notepad;

        const include      = (expected: string)   => (actual: string[]) => expect(actual).to.eventually.include(expected),
              includeAllOf = (expected: string[]) => (actual: string[]) => expect(actual).to.eventually.include.members(expected),
              equals       = <T>(expected: T)     => (actual: T)        => expect(actual).to.eventually.equal(expected);

        beforeEach(() => notepad = {});

        it ('stores notes in a notepad as promises to be resolved', () => {
            const displayedVoucher = MyVoucherCode.shownAs('SUMMER2017');

            const actor = Actor.named('Benjamin').whoCan(TakeNotes.using(notepad));

            return actor.attemptsTo(
                TakeNote.of(displayedVoucher).as('my voucher'),
            ).
            then(() => notepad['my voucher']).
            then(voucher => expect(voucher).to.equal('SUMMER2017'));
        });

        it('stores notes using a topic name derived from the question', () => {
            const
                displayedVoucher = MyVoucherCode.shownAs('SUMMER2017'),
                availableVoucher = AvailableVoucher.of('SUMMER2017'),

                actor = Actor.named('Benjamin').whoCan(TakeNotes.usingAnEmptyNotepad());

            return actor.attemptsTo(
                TakeNote.of(displayedVoucher),
                CompareNotes.toSeeIf(availableVoucher, equals, displayedVoucher),
            );
        });

        it ('allows the Actor to remember a thing they\'ve seen', () => {
            const
                displayedVoucher = MyVoucherCode.shownAs('SUMMER2017'),
                availableVoucher = AvailableVoucher.of('SUMMER2017'),

                actor = Actor.named('Benjamin').whoCan(TakeNotes.using(notepad));

            return actor.attemptsTo(
                TakeNote.of(displayedVoucher),
                /* perform some other tasks */
                CompareNotes.toSeeIf(availableVoucher, equals, displayedVoucher),
            );
        });

        it ('allows the Actor to remember several things they\'ve seen one after another', () => {
            const
                displayedVoucher = MyVoucherCode.shownAs('SUMMER2017'),
                otherDisplayedVoucher = MyVoucherCode.shownAs('50_OFF'),
                availableVouchers = AvailableVouchers.of('SUMMER2017', '50_OFF'),

                actor = Actor.named('Benjamin').whoCan(TakeNotes.using(notepad));

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
            const
                displayedVouchers = MyVoucherCodes.shownAs('SUMMER2017', 'SPRINGCLEANING'),
                availableVouchers = AvailableVouchers.of('SUMMER2017', '50_OFF', 'SPRINGCLEANING'),

                actor = Actor.named('Benjamin').whoCan(TakeNotes.using(notepad));

            return actor.attemptsTo(
                TakeNote.of(displayedVouchers).as('my vouchers'),
                CompareNotes.toSeeIf(availableVouchers, includeAllOf, 'my vouchers'),
            );
        });

        it ('allows the Actor to complain if you ask them about the thing they have no notes on', () => {
            const
                availableVouchers = AvailableVouchers.of('SUMMER2017', '5OFF', 'SPRINGCLEANING'),

                actor = Actor.named('Benjamin').whoCan(TakeNotes.using(notepad));

            return expect(actor.attemptsTo(
                CompareNotes.toSeeIf(availableVouchers, include, 'my voucher'),
            )).to.be.rejectedWith('I don\'t have any notes on the topic of "my voucher"');
        });
    });
});

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
