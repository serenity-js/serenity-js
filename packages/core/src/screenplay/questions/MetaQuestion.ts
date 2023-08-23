import type { Answerable } from '../Answerable';
import type { Question } from '../Question';

/**
 * A meta-question is a {@apilink Question} that can be answered
 * in the context of another {@apilink Answerable},
 * typically to transform its value.
 *
 * For example, the question {@apilink Text.of} can be answered in the context
 * of a {@apilink PageElement} to return its text content.
 *
 * {@apilink MetaQuestion|Meta questions} are typically used when filtering a {@apilink List}.
 *
 * ## Learn more
 * - {@apilink List}
 *
 * @group Questions
 */
export interface MetaQuestion<Supported_Context_Type, Returned_Question_Type extends Question<unknown>> {

    /**
     * Answers the given `MetaQuestion` in the context of another {@apilink Answerable}.
     *
     * #### Learn more
     * - {@apilink List}
     */
    of(context: Answerable<Supported_Context_Type>): Returned_Question_Type;

    /**
     * Human-readable description of this {@apilink MetaQuestion},
     * typically involving the description of the subject.
     *
     * For example, a description of a meta question obout "the text of an element"
     * would be `text of ${ element.toString() }`
     */
    toString(): string;
}
