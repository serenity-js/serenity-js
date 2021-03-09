import { Question } from '../Question';
import { Answerable } from '../Answerable';

/**
 * @public
 * @interface
 */
export interface MetaQuestion<Supported_Answerable_Type extends Answerable<any>, Answer> {
    /**
     * @desc
     *
     * @type {function<T>(another: Answerable): Question<Answer>}
     * @public
     */
    of: (answerable: Supported_Answerable_Type) => Question<Answer>;

    /**
     * @type {function(): string}
     * @public
     */
    toString: () => string;
}
