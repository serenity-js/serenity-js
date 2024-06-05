import type { UsesAbilities } from '../abilities/UsesAbilities';
import type { Answerable } from '../Answerable';
import { Question } from '../Question';
import type { AnswersQuestions } from './AnswersQuestions';
import type { MetaQuestion } from './MetaQuestion';
import { TypeInspector } from './TypeInspector';

const descriptionField = Symbol('description');

/**
 * @group Questions
 */
export abstract class Describable {

    private [descriptionField]: Answerable<string>;

    protected constructor(description: Answerable<string>) {
        this[descriptionField] = description;
    }

    /**
     * Resolves the description of this object in the context of the provided `actor`.
     *
     * @param actor
     */
    async describedBy(actor: AnswersQuestions & UsesAbilities & { name: string }): Promise<string> {
        const description = await actor.answer(this[descriptionField]);

        return description.replaceAll('#actor', actor.name);
    }

    /**
     * Changes the description of this object, as returned by {@apilink Describable.describedBy}
     * and {@apilink Describable.toString}.
     *
     * @param description
     *  Replaces the current description according to the following rules:
     *  - If `description` is an {@apilink Answerable}, it replaces the current description
     *  - If `description` is a {@apilink MetaQuestion}, the current description is passed as `context` to `description.of(context)`, and the result replaces the current description
     */
    describedAs(description: Answerable<string> | MetaQuestion<any, Question<Promise<string>>>): this {
        this[descriptionField] = Question.isAMetaQuestion(description)
            ? description.of(this[descriptionField]) // .describedAs(String(this[descriptionField]))
            : description

        return this;
    }

    /**
     * Returns a human-readable description of this object.
     */
    toString(): string {
        if (TypeInspector.isPromise(this[descriptionField])) {
            return 'Promise';
        }

        return String(this[descriptionField]);
    }
}
