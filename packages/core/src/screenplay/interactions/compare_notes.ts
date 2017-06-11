import { TakeNotes } from '../abilities';
import { Interaction } from '../activities';
import { AnswersQuestions, UsesAbilities } from '../actor';
import { Expectation } from '../expectations';
import { OneOrMany } from '../lists';
import { Question } from '../question';

export class CompareNotes<Expected, Actual extends PromiseLike<OneOrMany<Expected>> | OneOrMany<Expected>> implements Interaction {
    static toSeeIf<E, A extends PromiseLike<OneOrMany<E>> | OneOrMany<E>>(
        question: Question<A>,
        expectation: Expectation<E, A>,
        topic: { toString: () => string },
    ) {
        return new CompareNotes(question, expectation, topic.toString());
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return TakeNotes.
            as(actor).
            read(this.topic).
            then(expected => this.expect(expected)(actor.toSee(this.actual)));
    }

    constructor(private actual: Question<Actual>, private expect: Expectation<Expected, Actual>, private topic: string) {
    }

    toString = () => `{0} compares notes on ${this.subject()}`;

    private subject = () => `${ this.actual }` === `${ this.topic }`
        ? `${ this.actual }`
        : `${ this.actual } (noted as "${this.topic})`
}
