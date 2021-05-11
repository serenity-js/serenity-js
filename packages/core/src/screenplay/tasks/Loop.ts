import { formatted, Reducible } from '../../io';
import { Activity } from '../Activity';
import { AnswersQuestions, PerformsActivities, UsesAbilities } from '../actor';
import { Answerable } from '../Answerable';
import { Question } from '../Question';
import { Task } from '../Task';

/**
 * @desc
 *  Enables the {@link Actor} to iterate over a list of items produced by any {@link Answerable}.
 *
 *  You can think of `Loop` as a more sophisticated Screenplay-style equivalent of
 *  [`Array.forEach`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach).
 *  `Loop` is capable of working with both synchronous data structures,
 *  such as [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
 *  and `Question<Array<T>>`,
 *  as well as asynchronous ones, so `Promise<Array<T>>` and `Question<Promise<Array<T>>>`.
 *
 *  Use {@link Loop.item} to access the current item being processed by {@link Loop}, and {@link Loop.index}
 *  to access the index of {@link Loop.item} in the list.
 *
 * @example <caption>Basic scenario - Iterating over a static list of items</caption>
 *  import { actorCalled, Loop, Log } from '@serenity-js/core';
 *
 *  actorCalled('Joe').attemptsTo(
 *      Loop.over([ 'apple', 'banana', 'candy' ]).to(
 *          Log.the('current element', Loop.item<string>()),
 *          Log.the('current index', Loop.index()),
 *      ),
 *  );
 *
 * @example <caption>API scenario - Iterating over items in an API response</caption>
 *
 *  import { actorCalled, Loop } from '@serenity-js/core';
 *  import { Send, GetRequest, CallAnApi, LastResponse } from '@serenity-js/rest';
 *  import { Ensure, property, isGreaterThan } from '@serenity-js/assertions';
 *
 *  interface TodoItem {
 *      userId: number;
 *      id: number;
 *      title: string;
 *      completed: boolean;
 *  }
 *
 *  actorCalled('Joe').whoCan(
 *      CallAnApi.at('https://jsonplaceholder.typicode.com')
 *  ).attemptsTo(
 *      Send.a(GetRequest.to('/todos')),
 *      Loop.over(LastResponse.body<TodoItem[]>()).to(
 *          Ensure.that(
 *              Loop.item<TodoItem>(),
 *              property('userId', isGreaterThan(0)),
 *          ),
 *      )
 *  );
 *
 * @example <caption>UI scenario - Example widget</caption>
 *  <nav>
 *      <div data-test="cookies">
 *          <label for="functional-cookies">
 *              <input type="checkbox" id="functional-cookies" />Allow functional cookies
 *          </label>
 *          <label for="performance-cookies">
 *              <input type="checkbox" id="performance-cookies" />Allow performance cookies
 *          </label>
 *          <label for="advertising-cookies">
 *              <input type="checkbox" id="advertising-cookies" />Allow advertising cookies
 *          </label>
 *      </div>
 *  </nav>
 *
 * @example <caption>UI scenario - Lean Page Object</caption>
 *  import { Target } from '@serenity-js/protractor';
 *  import { browser, by } from 'protractor';
 *
 *  class Cookies {
 *      static labels = Target.all('cookie options')
 *          .located(by.css('[data-test="cookies"]'));
 *
 *      static checkbox = Target.the('checkbox')
 *          .located(by.tagName('input')),
 *  }
 *
 * @example <caption>UI scenario - Performing the same set of activities with each element</caption>
 *  import { actorCalled, Loop } from '@serenity-js/core';
 *  import { Click, Text, isSelected } from '@serenity-js/protractor';
 *  import { Ensure, startsWith } from '@serenity-js/assertions';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Joe')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
 *      .attemptsTo(
 *          Loop.over(Cookies.labels).to(
 *               Ensure.that(
 *                  Text.of(Loop.item<ElementFinder>()),
 *                  startsWith('Allow'),
 *              ),
 *
 *              Click.on(Loop.item<ElementFinder>()),
 *              Ensure.that(
 *                  Cookies.checkbox.of(Loop.item<ElementFinder>()),
 *                  isSelected(),
 *              ),
 *          ),
 *      );
 *
 * @extends {Task}
 *
 * @see {@link Loop.item}
 * @see {@link Loop.index}
 * @see {@link Question}
 */
export class Loop<Item> extends Task {
    private static currentItem: unknown = undefined;
    private static currentIndex = 0;

    /**
     * @desc
     *  Instantiates a {@link Task} to {@link Loop}
     *  that enables the {@link Actor} to iterate over `items`
     *  to perform some `activities`.
     *
     * @param {items: Answerable<ReducibleCollection>} items
     * @returns {LoopBuilder}
     */
    static over<T>(items: Answerable<Reducible>): { to: (...activities: Activity[]) => Loop<T> } {
        return {
            to: (...activities: Activity[]) =>
                new Loop<T>(items, activities)
        }
    }

    /**
     * @desc
     *  Returns the current item being processed by {@link Loop.over}.
     *
     *  **Please note** that in order for the TypeScript transpiler to understand the exact `ExpectedType`
     *  of the {@link Question} produced by this method you can optionally configure it with
     *  a [_type variable_](https://www.typescriptlang.org/docs/handbook/generics.html).
     *
     *  For example, configuring the method with type variable of `string`, so `Loop.item<string>()`,
     *  tells the transpiler that a `Question<string>` will be returned.
     *
     *  If the type variable is not configured, the transpiler assumes that returned type is a
     *  `Question<any>`. This means that while your code could still work, you'd miss out
     *  on checking provided by TypeScript.
     *
     * @returns {Question<ExpectedType>}
     */
    static item<ExpectedType = any>(): Question<ExpectedType> {
        return Question.about<ExpectedType>(`current loop item`, actor =>
            Loop.currentItem as ExpectedType,
        );
    }

    /**
     * @desc
     *  Returns the index of current {@link Loop.item} in the `Answerable<Array>` given to {@link Loop.over}.
     *
     *  The index starts at `0`.
     *
     * @returns {Question<number>}
     */
    static index(): Question<number> {
        return Question.about<number>(`current loop index`, actor =>
            Loop.currentIndex,
        );
    }

    /**
     * @param {Answerable<Reducible>} items
     * @param {Activity[]} activities
     */
    constructor(
        private readonly items: Answerable<Reducible>,
        private readonly activities: Activity[]
    ) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link Actor}
     *  perform this {@link Task}.
     *
     * @param {PerformsActivities & UsesAbilities & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link Actor}
     * @see {@link PerformsActivities}
     * @see {@link UsesAbilities}
     * @see {@link AnswersQuestions}
     */
    performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): PromiseLike<void> | PromiseLike<any> {
        return actor.answer(this.items)
            .then(items =>
                items.reduce((previous: Promise<void>, current: Item, index: number) => {
                    return previous.then(() => {
                        Loop.currentIndex = index;
                        Loop.currentItem  = current;

                        return actor.attemptsTo(
                            ...this.activities
                        );
                    });
                }, Promise.resolve(void 0))
            );
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        const description =  Array.isArray(this.items)
            ? `a list of ${ this.items.length } item${ this.items.length !== 1 ? 's' : '' }`
            : formatted `${ this.items }`;

        return `#actor loops over ${ description }`;
    }
}

/**
 * @typedef {Object} LoopBuilder
 * @property {function(...activities: Activity[]): Loop} to
 *
 * @example <caption>Basic scenario - Iterating over a static list of items</caption>
 *  import { actorCalled, Loop, Log } from '@serenity-js/core';
 *
 *  actorCalled('Joe').attemptsTo(
 *      Loop.over([ 'apple', 'banana', 'candy' ]).to(
 *          Log.the('current element', Loop.item<string>()),
 *      ),
 *  );
 *
 * @see {@link Loop}
 * @see {@link Loop.over}
 */
