import { ActivityType, step } from '../../recording';
import { TakeNotes } from '../abilities';
import { Interaction } from '../activities';
import { AnswersQuestions, UsesAbilities } from '../actor';
import { Expectation } from '../expectations';
import { OneOrMany } from '../lists';
import { Question } from '../question';

export class CompareNotes<S> implements Interaction {
    static toSeeIf<A>(actual: Question<OneOrMany<A>>, expectation: Expectation<OneOrMany<A>>, topic: { toString: () => string }) {
        return new CompareNotes<A>(actual, expectation, topic.toString());
    }

    @step('{0} compares notes on #subject', ActivityType.Interaction)
    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return TakeNotes.
            as(actor).
            read(this.topic).
            then(expected => this.expect(expected)(actor.toSee(this.actual)));
    }

    constructor(private actual: Question<OneOrMany<S>>, private expect: Expectation<OneOrMany<S>>, private topic: string) {
    }

    private subject = () => `${ this.actual }` === `${ this.topic }`
        ? `${ this.actual }`
        : `${ this.actual } (noted as "${this.topic})`
}
