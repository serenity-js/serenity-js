import { AnswersQuestions, UsesAbilities } from '../../actor';
import { Expectation } from '../Expectation';
import { MetaQuestion } from '../MetaQuestion';

/**
 * @desc
 *  Adapts various types of collections so that they can be used with {@link List}.
 *
 *  You probably won't need to implement this interface, unless you're extending Serenity/JS.
 *
 * @see {@link List}
 */
export interface ListAdapter<
    Item_Type,
    Collection_Type,
    Item_Return_Type = Item_Type,
    Collection_Return_Type = Collection_Type
> {
    count(actor: AnswersQuestions & UsesAbilities): Promise<number>;

    first(actor: AnswersQuestions & UsesAbilities): Item_Return_Type;
    last(actor: AnswersQuestions & UsesAbilities): Item_Return_Type;
    get(actor: AnswersQuestions & UsesAbilities, index: number): Item_Return_Type;

    items(actor: AnswersQuestions & UsesAbilities): Collection_Return_Type;

    withFilter<Answer_Type>(
        question: MetaQuestion<Item_Type, Promise<Answer_Type> | Answer_Type>,
        expectation: Expectation<any, Answer_Type>,
    ): ListAdapter<Item_Type, Collection_Type, Item_Return_Type, Collection_Return_Type>;

    toString(): string;
}
