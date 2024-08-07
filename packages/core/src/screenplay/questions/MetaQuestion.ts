import type { Answerable } from '../Answerable';
import type { Question } from '../Question';

/**
 * A meta-question is a [`Question`](https://serenity-js.org/api/core/class/Question/) that can be answered
 * in the context of another [`Answerable`](https://serenity-js.org/api/core/#Answerable),
 * typically to transform its value.
 *
 * For example, the question [`Text.of`](https://serenity-js.org/api/web/class/Text/#of) can be answered in the context
 * of a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) to return its text content.
 *
 * [Meta-questions](https://serenity-js.org/api/core/interface/MetaQuestion/) are typically used when filtering a [`List`](https://serenity-js.org/api/core/class/List/).
 *
 * ## Learn more
 * - [`List`](https://serenity-js.org/api/core/class/List/)
 *
 * @group Questions
 */
export interface MetaQuestion<Supported_Context_Type, Returned_Question_Type extends Question<unknown>> {

    /**
     * Answers the given `MetaQuestion` in the context of another [`Answerable`](https://serenity-js.org/api/core/#Answerable).
     *
     * #### Learn more
     * - [`List`](https://serenity-js.org/api/core/class/List/)
     */
    of(context: Answerable<Supported_Context_Type>): Returned_Question_Type;

    /**
     * Human-readable description of this [`MetaQuestion`](https://serenity-js.org/api/core/interface/MetaQuestion/),
     * typically involving the description of the subject.
     *
     * For example, a description of a meta question obout "the text of an element"
     * would be `text of ${ element.toString() }`
     */
    toString(): string;
}
