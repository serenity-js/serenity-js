import { contain, equals } from '@serenity-js/assertions';
import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Question, Task, the, Wait } from '@serenity-js/core';
import { Page } from '@serenity-js/web';

/**
 * Represents the view state that views such as Capabilities and Scenarios sync to the URL
 * after they re-render, for example `#/capabilities?filter=healthy&sort=confidence`.
 *
 * Views omit parameters set to their default values from the URL, so the questions
 * report the default value of any parameter that's absent.
 *
 * Each view declares the parameters it syncs to the URL, and their default values,
 * via the `defaults` object, which also determines the parameter names the questions and tasks accept.
 *
 * Interaction objects use `UrlViewState` to wait for the view to complete
 * the state change caused by a task, so that tests can rely on the URL
 * and the rendered view straight after the task.
 *
 * ## Usage within an interaction object
 *
 * ```ts
 * // Parameter names are inferred from the defaults: 'search' | 'filter' | 'sort'
 * private readonly urlState = new UrlViewState({ search: '', filter: 'all', sort: 'name' });
 *
 * selectSort = (option: Answerable<string>): Task =>
 *     Task.where(the`#actor sorts by ${ option }`,
 *         Select.value(option).from(this.sortSelect),
 *         this.urlState.waitUntilEquals('sort', option),
 *     );
 * ```
 *
 * @package
 */
export class UrlViewState<Parameter extends string> {

    /**
     * @param defaults
     *  The parameters the view syncs to the URL, mapped to the values the view uses when the URL doesn't specify them
     */
    constructor(private readonly defaults: Record<Parameter, string>) {
    }

    /**
     * The value of the given parameter in the current URL,
     * or the parameter's default value if the URL doesn't specify it.
     *
     * @param name
     */
    parameter = (name: Parameter): QuestionAdapter<string> =>
        Question.about<string>(`${ name } parameter of the current URL`, async actor => {
            const href = await actor.answer(Page.current().url().href);
            const query = href.split('?')[1] ?? '';

            return new URLSearchParams(query).get(name) ?? this.defaults[name];
        });

    /**
     * Waits until the given parameter in the current URL equals the expected value.
     *
     * @param name
     * @param expectedValue
     */
    waitUntilEquals = (name: Parameter, expectedValue: Answerable<string>): Task =>
        Task.where(the`#actor waits for the ${ name } in the URL to equal ${ expectedValue }`,
            Wait.until(this.parameter(name), equals(expectedValue)),
        );

    /**
     * Waits until the given parameter in the current URL, which represents a comma-separated list
     * of values, contains the expected value. For example, views that allow for selecting several filters
     * at once represent them as `filter=failed,skipped`.
     *
     * @param name
     * @param expectedValue
     */
    waitUntilContains = (name: Parameter, expectedValue: Answerable<string>): Task =>
        Task.where(the`#actor waits for the ${ name } in the URL to contain ${ expectedValue }`,
            Wait.until(this.parameter(name).as(value => value.split(',')), contain(expectedValue)),
        );
}
