import { Answerable } from '../Answerable';
import { Question } from '../Question';

/**
 * A "meta question" is a {@link Question} about another {@link Answerable},
 * used to retrieve a transformed version of the value that answerable holds.
 *
 * For example, the question [[Text.of]]
 * returns text content of a {@link PageElement}.
 *
 * {@link MetaQuestion|Meta questions} are typically used when filtering a {@link List}.
 *
 * ## Learn more
 * - {@link List}
 *
 * @group Answerables
 */
export interface MetaQuestion<Supported_Answerable_Type extends Answerable<any>, Answer> {

    /**
     * Transforms a given `answerable` to another {@link Question}.
     *
     * #### Learn more
     * - {@link List}
     */
    of(answerable: Supported_Answerable_Type): Question<Answer>;

    /**
     * Human-readable description of this {@link MetaQuestion},
     * typically involving the description of the subject.
     *
     * For example, a description of a meta question obout "the text of an element"
     * would be `text of ${ element.toString() }`
     */
    toString(): string;
}
