import { Interaction, Question, TakeNotes, UsesAbilities } from '../index';

export class TakeNote<T> implements Interaction {
    static of = <Answer>(question: Question<Answer>) => new TakeNote<Answer>(question, question);

    as = (topic: string) => (this.topic = topic, this);

    performAs(actor: UsesAbilities): PromiseLike<void> {
        return TakeNotes.as(actor).note(this.topic.toString(), this.question.answeredBy(actor));
    }

    constructor(private question: Question<T>, private topic: { toString: () => string }) {
    }

    toString = () => `{0} takes a note of ${this.subject()}`;

    private subject = () => `${ this.question }` === `${ this.topic }`
        ? `${ this.question }`
        : `${ this.question } (noted as "${this.topic})`
}
