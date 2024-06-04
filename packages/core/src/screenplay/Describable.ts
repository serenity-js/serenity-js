import type { UsesAbilities } from './abilities/UsesAbilities';
import type { Answerable } from './Answerable';
import { Description } from './Description';
import { Question } from './Question';
import type { AnswersQuestions, MetaQuestion } from './questions';

const descriptionField = Symbol('description');

export abstract class Describable {

    private [descriptionField]: Answerable<string>;

    protected constructor(description: Answerable<string>) {
        this[descriptionField] = description;
    }

    async describedBy(actor: AnswersQuestions & UsesAbilities): Promise<Description> {
        const description = await actor.answer(this[descriptionField]);
        // todo: Do I need the Description class at all?
        return new Description(description);
    }

    /**
     * Changes the description of this question's subject.
     *
     * @param description
     */
    describedAs(description: Answerable<string> | MetaQuestion<any, Question<Promise<string>>>): this {
        this[descriptionField] = Question.isAMetaQuestion(description)
            ? description.of(this[descriptionField]).describedAs(String(this[descriptionField]))
            : description

        return this;
    }

    /**
     * Generates a human-friendly description to be used when reporting this Activity.
     *
     * **Note**: When this activity is reported, token `#actor` in the description
     * will be replaced with the name of the actor performing this Activity.
     *
     * For example, `#actor clicks on a button` becomes `Wendy clicks on a button`.
     */
    toString(): string {
        // todo: review if this is sufficient
        return String(this[descriptionField]);
    }
}
