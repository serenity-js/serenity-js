import { ArrayListAdapter, ListAdapter } from './lists';
import { Answerable } from '../Answerable';
import { Question } from '../Question';
import { MetaQuestion } from './MetaQuestion';
import { Expectation } from './Expectation';
import { formatted } from '../../io';
import { AnswersQuestions, UsesAbilities } from '../actor';

/**
 * @desc
 *  Filters a list of items based on the criteria provided.
 *  Instantiate via {@link List.of}
 *
 * @extends {Question}
 * @see {@link MetaQuestion}
 */
export class List<
    List_Adapter_Type extends ListAdapter<Item_Type, Collection_Type, Item_Return_Type, Collection_Return_Type>,
    Item_Type,
    Collection_Type,
    Item_Return_Type = Item_Type,
    Collection_Return_Type = Collection_Type,
>
    extends Question<Collection_Return_Type>
{

    /**
     * @desc
     *  Instantiates a new {@link List} configured to support standard {@link Array}.
     *
     *  **Please note:** Don't use `List.of` to wrap `Question<ElementArrayFinder>` returned by [`Target.all`](/modules/protractor/class/src/screenplay/questions/targets/Target.ts~Target.html#static-method-all).
     *  Instead, use [`Target.all(...).located(...).where(...)`](/modules/protractor/class/src/screenplay/questions/targets/Target.ts~Target.html), which uses a Protractor-specific
     *  {@link ListAdapter}.
     *
     * @param {Answerable<Item_Type[]>} items
     *
     * @returns {List<ArrayListAdapter<Item_Type>, Item_Type, Item_Type[], Promise<Item_Type>, Promise<Item_Type[]>>}
     */
    static of<Item_Type>(items: Answerable<Item_Type[]>) {
        return new List<ArrayListAdapter<Item_Type>, Item_Type, Item_Type[], Promise<Item_Type>, Promise<Item_Type[]>>(
            new ArrayListAdapter(items)
        );
    }

    /**
     * @param {List_Adapter_Type} collection
     */
    constructor(private readonly collection: List_Adapter_Type) {
        super(formatted`${ collection }`);
    }

    /**
     * @desc
     *  Returns the number of items left after applying any filters,
     *
     * @returns {Question<Promise<number>>}
     *
     * @see {@link List#where}
     */
    count(): Question<Promise<number>> {
        return Question.about(`the number of ${ this.collection.toString() }`, actor =>
            this.collection.count(actor)
        );
    }

    /**
     * @desc
     *  Returns the first of items left after applying any filters,
     *
     * @returns {Question<Item_Return_Type>}
     *
     * @see {@link List#where}
     */
    first(): Question<Item_Return_Type> {
        return Question.about(`the first of ${ this.collection.toString() }`, actor =>
            this.collection.first(actor)
        );
    }

    /**
     * @desc
     *  Returns the last of items left after applying any filters,
     *
     * @returns {Question<Item_Return_Type>}
     *
     * @see {@link List#where}
     */
    last(): Question<Item_Return_Type> {
        return Question.about(`the last of ${ this.collection.toString() }`, actor =>
            this.collection.last(actor)
        );
    }

    /**
     * @desc
     *  Returns the nth of the items left after applying any filters,
     *
     * @param {number} index
     *  Zero-based index of the item to return
     *
     * @returns {Question<Item_Return_Type>}
     *
     * @see {@link List#where}
     */
    get(index: number): Question<Item_Return_Type> {
        return Question.about(`the ${ List.ordinalSuffixOf(index + 1) } of ${ this.collection }`, actor =>
            this.collection.get(actor, index)
        );
    }

    /**
     * @desc
     *  Filters the underlying collection so that the result contains only those elements that meet the {@link Expectation}
     *
     * @param {MetaQuestion<Item_Type, Promise<Answer_Type> | Answer_Type>} question
     * @param {Expectation<any, Answer_Type>} expectation
     *
     * @returns {List<List_Adapter_Type, Item_Type, Collection_Type, Item_Return_Type, Collection_Return_Type>}
     */
    where<Answer_Type>(
        question: MetaQuestion<Item_Type, Promise<Answer_Type> | Answer_Type>,
        expectation: Expectation<any, Answer_Type>,
    ): List<List_Adapter_Type, Item_Type, Collection_Type, Item_Return_Type, Collection_Return_Type> {
        return new List<List_Adapter_Type, Item_Type, Collection_Type, Item_Return_Type, Collection_Return_Type>(
            this.collection.withFilter(question, expectation) as List_Adapter_Type,
        );
    }

    /**
     * @desc
     *  Makes the provided {Actor} answer this {Question} and return the underlying collection.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Collection_Return_Type}
     *
     * @see {@link Actor}
     * @see {@link AnswersQuestions}
     * @see {@link UsesAbilities}
     */
    answeredBy(actor: AnswersQuestions & UsesAbilities): Collection_Return_Type {
        return this.collection.items(actor);
    }

    private static ordinalSuffixOf(index: number) {
        const
            j = index % 10,
            k = index % 100;

        switch (true) {
            case (j === 1 && k !== 11):
                return index + 'st';
            case (j === 2 && k !== 12):
                return index + 'nd';
            case (j === 3 && k !== 13):
                return index + 'rd';
            default:
                return index + 'th';
        }
    }
}
