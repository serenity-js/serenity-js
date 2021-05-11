import { Answerable } from '../Answerable';
import { Question } from '../Question';

/**
 * @desc
 *  A {@link Question} about another {@link Answerable}, used to retrieve a transformed version of the value it holds, or to compose {@link Question}s.
 *
 *  For example, the question [`Text.of`](/modules/protractor/class/src/screenplay/questions/text/Text.ts~Text.html)
 *  returns text content of an {@link ElementFinder} returned by [`Target`](/modules/protractor/class/src/screenplay/questions/targets/Target.ts~Target.html),
 *  which is a `Question<ElementFinder>`.
 *
 *  `MetaQuestion`s are typically used when filtering a {@link List}.
 *
 * @see {@link List}
 *
 * @public
 * @interface
 */
export interface MetaQuestion<Supported_Answerable_Type extends Answerable<any>, Answer> {
    /**
     * @desc
     *  Transforms a given `answerable`
     *  to another {@link Question}.
     *
     * @type {function<T>(another: Answerable): Question<Answer>}
     * @public
     *
     * @see {@link List}
     */
    of: (answerable: Supported_Answerable_Type) => Question<Answer>;

    /**
     * @desc
     *  Human-readable description of a given {@link MetaQuestion},
     *
     * @type {function(): string}
     * @public
     */
    toString: () => string;
}
