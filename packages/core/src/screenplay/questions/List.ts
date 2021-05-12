import { formatted } from '../../io';
import { AnswersQuestions, UsesAbilities } from '../actor';
import { Answerable } from '../Answerable';
import { Question } from '../Question';
import { Expectation } from './Expectation';
import { ArrayListAdapter, ListAdapter } from './lists';
import { MetaQuestion } from './MetaQuestion';

/**
 * @desc
 *  Filters an {@link Answerable} list of items based on the criteria provided.
 *  Instantiate via {@link List.of}
 *
 * @example <caption>Example data structure</caption>
 *  interface TestAccount {
 *      username: string;
 *      role: string;
 *      environments: string[];
 *  }
 *
 *  const testAccounts: TestAccount[] = [
 *      {
 *          "username": "tester.one@example.com",
 *          "role": "test-automation"
 *          "environments": [ "dev", "sit" ],
 *      },
 *      {
 *          "username": "tester.two@example.com",
 *          "role": "test-automation"
 *          "environments": [ "dev", "sit", "prod" ],
 *      },
 *      {
 *          "username": "release.bot@example.com",
 *          "role": "release-automation"
 *          "environments": [ "dev", "sit", "prod" ],
 *      }
 *  ]
 *
 * @example <caption>Using with Property</caption>
 *  import { actorCalled, List, Property } from '@serenity-js/core';
 *  import { contain, Ensure, equals } from '@serenity-js/assertions';
 *
 *  actorCalled('Lisa').attemptsTo(
 *      Ensure.that(
 *          Property.of(
 *              List.of(testAccounts)
 *                  .where(Property.at<TestAccount>().environments, contain('prod'))
 *                  .where(Property.at<TestAccount>().role, equals('test-automation'))
 *                  .first()
 *              ).username,
 *          equals('tester.two@example.com')
 *      )
 *  )
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
     *  **Please note:** Don't use `List.of` to wrap `Question<ElementArrayFinder>` returned by
     *  [`Target.all`](/modules/protractor/class/src/screenplay/questions/targets/Target.ts~Target.html#static-method-all).
     *  Instead, use [`Target.all(...).located(...).where(...)`](/modules/protractor/class/src/screenplay/questions/targets/Target.ts~Target.html),
     *  which uses a Protractor-specific {@link ListAdapter}.
     *
     * @param {Answerable<Item_Type[]>} items
     *
     * @returns {List<ArrayListAdapter<Item_Type>, Item_Type, Item_Type[], Promise<Item_Type>, Promise<Item_Type[]>>}
     */
    static of<Item_Type>(items: Answerable<Item_Type[]>): List<ArrayListAdapter<Item_Type>, Item_Type, Item_Type[], Promise<Item_Type>, Promise<Item_Type[]>> {
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
     * @example <caption>Counting items</caption>
     *  import { actorCalled, List } from '@serenity-js/core';
     *  import { Ensure, equals, property } from '@serenity-js/assertions';
     *
     *  actorCalled('Lisa').attemptsTo(
     *      Ensure.that(
     *          List.of(testAccounts).count(),
     *          equals(3)
     *      )
     *  )
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
     * @example <caption>Retrieving the first item</caption>
     *  import { actorCalled, List } from '@serenity-js/core';
     *  import { Ensure, equals, property } from '@serenity-js/assertions';
     *
     *  actorCalled('Lisa').attemptsTo(
     *      Ensure.that(
     *          List.of(testAccounts).first(),
     *          property('username', equals('tester.one@example.com'))
     *      )
     *  )
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
     * @example <caption>Retrieving the last item</caption>
     *  import { actorCalled, List } from '@serenity-js/core';
     *  import { Ensure, equals, property } from '@serenity-js/assertions';
     *
     *  actorCalled('Lisa').attemptsTo(
     *      Ensure.that(
     *          List.of(testAccounts).last(),
     *          property('username', equals('release.bot@example.com'))
     *      )
     *  )
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
     * @example <caption>Retrieving the nth item</caption>
     *  import { actorCalled, List } from '@serenity-js/core';
     *  import { Ensure, equals, property } from '@serenity-js/assertions';
     *
     *  actorCalled('Lisa').attemptsTo(
     *      Ensure.that(
     *          List.of(testAccounts).get(1),
     *          property('username', equals('tester.two@example.com'))
     *      )
     *  )
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
     * @example <caption>Filtering a list</caption>
     *  import { actorCalled, List, Property } from '@serenity-js/core';
     *  import { contain, Ensure, equals, property } from '@serenity-js/assertions';
     *
     *  actorCalled('Lisa').attemptsTo(
     *      Ensure.that(
     *          List.of(testAccounts)
     *              .where(Property.at<TestAccount>().environments, contain('prod'))
     *              .where(Property.at<TestAccount>().role, equals('test-automation'))
     *              .first(),
     *          property('username', equals('tester.two@example.com'))
     *      )
     *  )
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
     *  Makes the provided {@link Actor} answer this {@link Question} and return the underlying collection.
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

    private static ordinalSuffixOf(index: number): string {
        const
            lastDigit = index % 10,
            lastTwoDigits = index % 100;

        switch (true) {
            case (lastDigit === 1 && lastTwoDigits !== 11):
                return index + 'st';
            case (lastDigit === 2 && lastTwoDigits !== 12):
                return index + 'nd';
            case (lastDigit === 3 && lastTwoDigits !== 13):
                return index + 'rd';
            default:
                return index + 'th';
        }
    }
}
