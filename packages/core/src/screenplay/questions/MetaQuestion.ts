import { Answerable } from '../Answerable';
import { Question } from '../Question';

/**
 * A "meta question" is a {@apilink Question} about another {@apilink Answerable},
 * used to retrieve a transformed version of the value that answerable holds.
 *
 * For example, the question {@apilink Text.of}
 * returns text content of a {@apilink PageElement}.
 *
 * {@apilink MetaQuestion|Meta questions} are typically used when filtering a {@apilink List}.
 *
 * ## Learn more
 * - {@apilink List}
 *
 * @group Questions
 */
export interface MetaQuestion<Supported_Answerable_Type extends Answerable<any>, Answer> {

    /**
     * Transforms a given `answerable` to another {@apilink Question}.
     *
     * #### Learn more
     * - {@apilink List}
     */
    of(answerable: Supported_Answerable_Type): Question<Answer>;

    /**
     * Human-readable description of this {@apilink MetaQuestion},
     * typically involving the description of the subject.
     *
     * For example, a description of a meta question obout "the text of an element"
     * would be `text of ${ element.toString() }`
     */
    toString(): string;
}
