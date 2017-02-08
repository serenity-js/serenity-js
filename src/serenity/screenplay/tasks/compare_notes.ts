import { step } from '../../recording/step_annotation';
import { TakeNotes } from '../abilities';
import { AnswersQuestions, UsesAbilities } from '../actor';
import { Expectation } from '../expectations';
import { OneOrMany } from '../lists';
import { Performable } from '../performables';
import { Question } from '../question';

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
