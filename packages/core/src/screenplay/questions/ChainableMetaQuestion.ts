import type { Answerable } from '../Answerable';
import type { Question } from '../Question';
import type { MetaQuestion } from './MetaQuestion';

/**
 * A chainable meta-question is a {@apilink MetaQuestion} that can be answered
 * in the context of another {@apilink Answerable},
 * and form a chain of transformations.
 *
 * {@apilink MetaQuestion|Meta questions} are typically used when filtering a {@apilink List}.
 *
 * ## Learn more
 * - {@apilink List}
 *
 * @group Questions
 */
export interface ChainableMetaQuestion<
    Supported_Context_Type,
    Returned_Question_Type extends Question<unknown>
> extends MetaQuestion<Supported_Context_Type, Returned_Question_Type & ChainableMetaQuestion<Supported_Context_Type, Returned_Question_Type>> {

    /**
     * Answers the given `ChainableMetaQuestion` in the context of another {@apilink Answerable}
     * and returns another `ChainableMetaQuestion` ready for further chaining.
     *
     * #### Learn more
     * - {@apilink List}
     */
    of(context: Answerable<Supported_Context_Type>): Returned_Question_Type & ChainableMetaQuestion<Supported_Context_Type, Returned_Question_Type>;
}
