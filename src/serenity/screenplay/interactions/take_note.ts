import { ActivityType, step } from '../../recording';
import { Interaction, Question, TakeNotes, UsesAbilities } from '../index';

export class TakeNote<T> implements Interaction {
    static of = <Answer>(question: Question<Answer>) => new TakeNote<Answer>(question, question);

    as = (topic: string) => (this.topic = topic, this);

    @step('{0} takes a note of #subject', ActivityType.Interaction)
    performAs(actor: UsesAbilities): PromiseLike<void> {
        return TakeNotes.as(actor).note(this.topic.toString(), this.question.answeredBy(actor));
    }

    constructor(private question: Question<T>, private topic: { toString: () => string }) {
    }

    private subject = () => `${ this.question }` === `${ this.topic }`
        ? `${ this.question }`
        : `${ this.question } (noted as "${this.topic})`
}
