import { Answerable, AnswersQuestions } from '@serenity-js/core';
import { commaSeparated, formatted } from '@serenity-js/core/lib/io';
import { inspected } from '@serenity-js/core/lib/io/inspected';
import {
    Interaction,
    PerformsActivities,
    UsesAbilities,
} from '@serenity-js/core/lib/screenplay';
import { ElementHandle } from 'playwright';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  select an option from a [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select),
 *  either by its display name, or by value.
 *
 * @see {@link Selected}
 */
export class Select {
    /**
   * @desc
   *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}
   *  with a [`value`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#attr-value)
   *  of a single [`<option>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
   *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor} to select.
   *
   * @example <caption>Example widget</caption>
   *  <select data-test='countries'>
   *      <option value='UK'>United Kingdom</option>
   *      <option value='PL'>Poland</option>
   *      <option value='US'>United States</option>
   *  </select>
   *
   * @example <caption>Lean Page Object describing the widget</caption>
   *  import { Target } from '@serenity-js/playwright';
   *
   *  class Countries {
   *      static dropdown = Target.the('countries dropdown')
   *          .selectedBy('[data-test="countries"]');
   *  }
   *
   * @example <caption>Retrieving the selected value</caption>
   *  import { actorCalled } from '@serenity-js/core';
   *  import { BrowseTheWeb, Select, Selected } from '@serenity-js/playwright';
   *  import { Ensure, equals } from '@serenity-js/assertions';
   *  import { chromium } from 'playwright';
   *
   *  actorCalled('Nick')
   *      .whoCan(BrowseTheWeb.using(chromium))
   *      .attemptsTo(
   *          Select.value('UK').from(Countries.dropdown),
   *          Ensure.that(Selected.valueOf(Countries.dropdown), equals('UK')),
   *      );
   *
   * @param {string | Answerable<string>} value
   *  A value of the [`option` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
   *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor} to select
   *
   * @returns {SelectBuilder}
   *
   * @see {@link Selected.valueOf}
   * @see {@link BrowseTheWeb}
   * @see {@link Target}
   * @see {@link @serenity-js/assertions~Ensure}
   * @see {@link @serenity-js/assertions/lib/expectations~equals}
   */
    static value(value: string | Answerable<string>): { from: (target: Answerable<ElementHandle>) => Interaction; } {
        return {
            from: (target: Answerable<ElementHandle>): Interaction =>
                new SelectValue(value, target),
        };
    }

    /**
   * @desc
   *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}
   *  with [`value`s](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#attr-value)
   *  of multiple [`<option>` elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
   *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor} to select.
   *
   * @example <caption>Example widget</caption>
   *  <select multiple data-test='countries'>
   *      <option value='UK'>United Kingdom</option>
   *      <option value='PL'>Poland</option>
   *      <option value='US'>United States</option>
   *  </select>
   *
   * @example <caption>Lean Page Object describing the widget</caption>
   *  import { Target } from '@serenity-js/playwright';
   *
   *  class Countries {
   *      static dropdown = Target.the('countries dropdown')
   *          .located(by.css('[data-test="countries"]'));
   *  }
   *
   * @example <caption>Retrieving the selected value</caption>
   *  import { actorCalled } from '@serenity-js/core';
   *  import { BrowseTheWeb, Select, Selected } from '@serenity-js/playwright';
   *  import { Ensure, equals } from '@serenity-js/assertions';
   *  import { chromium } from 'playwright';
   *
   *  actorCalled('Nick')
   *      .whoCan(BrowseTheWeb.using(chromium))
   *      .attemptsTo(
   *          Select.values('UK').from(Countries.dropdown),
   *          Ensure.that(Selected.valuesOf(Countries.dropdown), equals([ 'UK' ])),
   *      );
   *
   * @param {Array<Answerable<string[] | string>>} values
   *  Values of the [`option` elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
   *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor} to select
   *
   * @returns {SelectBuilder}
   *
   * @see {@link Selected.valuesOf}
   * @see {@link BrowseTheWeb}
   * @see {@link Target}
   * @see {@link @serenity-js/assertions~Ensure}
   * @see {@link @serenity-js/assertions/lib/expectations~equals}
   */
    static values(...values: Array<Answerable<string[] | string>>): { from: (target: Answerable<ElementHandle>) => Interaction; } {
        return {
            from: (target: Answerable<ElementHandle>): Interaction =>
                new SelectValues(values, target),
        };
    }

    /**
   * @desc
   *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}
   *  with a single [`option`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
   *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor} to select.
   *
   * @example <caption>Example widget</caption>
   *  <select data-test='countries'>
   *      <option value='UK'>United Kingdom</option>
   *      <option value='PL'>Poland</option>
   *      <option value='US'>United States</option>
   *  </select>
   *
   * @example <caption>Lean Page Object describing the widget</caption>
   *  import { Target } from '@serenity-js/playwright';
   *
   *  class Countries {
   *      static dropdown = Target.the('countries dropdown')
   *          .located(by.css('[data-test="countries"]'));
   *  }
   *
   * @example <caption>Retrieving the selected value</caption>
   *  import { actorCalled } from '@serenity-js/core';
   *  import { BrowseTheWeb, Select, Selected } from '@serenity-js/playwright';
   *  import { Ensure, equals } from '@serenity-js/assertions';
   *  import { chromium } from 'playwright';
   *
   *  actorCalled('Nick')
   *      .whoCan(BrowseTheWeb.using(chromium))
   *      .attemptsTo(
   *          Select.option('Poland').from(Countries.dropdown),
   *          Ensure.that(
   *              Selected.optionIn(Countries.dropdown),
   *              equals('Poland')
   *          ),
   *      );
   *
   * @param {string | Answerable<string>} value
   *  Text of the [`option` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
   *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor} to select
   *
   * @returns {SelectBuilder}
   *
   * @see {@link Selected.optionIn}
   * @see {@link BrowseTheWeb}
   * @see {@link Target}
   * @see {@link @serenity-js/assertions~Ensure}
   * @see {@link @serenity-js/assertions/lib/expectations~equals}
   */
    static option(value: string | Answerable<string>): { from: (target: Answerable<ElementHandle>) => Interaction; } {
        return {
            from: (target: Answerable<ElementHandle>): Interaction =>
                new SelectOption(value, target),
        };
    }

    /**
   * @desc
   *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}
   *  with [`option`s](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
   *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor} to select.
   *
   * @example <caption>Example widget</caption>
   *  <select multiple data-test='countries'>
   *      <option value='UK'>United Kingdom</option>
   *      <option value='PL'>Poland</option>
   *      <option value='US'>United States</option>
   *  </select>
   *
   * @example <caption>Lean Page Object describing the widget</caption>
   *  import { Target } from '@serenity-js/playwright';
   *
   *  class Countries {
   *      static dropdown = Target.the('countries dropdown')
   *          .located(by.css('[data-test="countries"]'));
   *  }
   *
   * @example <caption>Retrieving the selected value</caption>
   *  import { actorCalled } from '@serenity-js/core';
   *  import { BrowseTheWeb, Select, Selected } from '@serenity-js/playwright';
   *  import { Ensure, equals } from '@serenity-js/assertions';
   *  import { chromium } from 'playwright';
   *
   *  actorCalled('Nick')
   *      .whoCan(BrowseTheWeb.using(chromium))
   *      .attemptsTo(
   *          Select.options('Poland', 'United States').from(Countries.dropdown),
   *          Ensure.that(
   *              Selected.optionsIn(Countries.dropdown),
   *              equals([ 'Poland', 'United States' ])
   *          ),
   *      );
   *
   * @param {Array<Answerable<string[] | string>>} values
   *  Text of the [`option` elements  ](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
   *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor} to select
   *
   * @returns {SelectBuilder}
   *
   * @see {@link Selected.optionsIn}
   * @see {@link BrowseTheWeb}
   * @see {@link Target}
   * @see {@link @serenity-js/assertions~Ensure}
   * @see {@link @serenity-js/assertions/lib/expectations~equals}
   */
    static options(...values: Array<Answerable<string[] | string>>): { from: (target: Answerable<ElementHandle>) => Interaction; } {
        return {
            from: (target: Answerable<ElementHandle>): Interaction =>
                new SelectOptions(values, target),
        };
    }
}

/**
 * @package
 */
class SelectValue implements Interaction {
    constructor(
        private readonly value: Answerable<string>,
        private readonly target: Answerable<ElementHandle>
    ) {}

    async performAs(
        actor: UsesAbilities & AnswersQuestions & PerformsActivities
    ): Promise<void> {
        const value = await actor.answer(this.value);
        const picklist = await actor.answer(this.target);
        await picklist.selectOption(value);
    }

    toString() {
        return formatted`#actor selects value ${this.value} from ${this.target}`;
    }
}

/**
 * @package
 */
class SelectValues implements Interaction {
    constructor(
        private readonly values: Array<Answerable<string[] | string>>,
        private readonly target: Answerable<ElementHandle>
    ) {}

    async performAs(
        actor: UsesAbilities & AnswersQuestions & PerformsActivities
    ): Promise<void> {
        const values = await Promise.all(this.values.map(actor.answer));
        const picklist = await actor.answer(this.target);
        await picklist.selectOption(flatten(values));
    }

    toString() {
        return `#actor selects values ${commaSeparated(
            flatten(this.values),
            inspected
        )} from ${this.target}`;
    }
}

/**
 * @package
 */
class SelectOption implements Interaction {
    constructor(
        private readonly option: Answerable<string>,
        private readonly target: Answerable<ElementHandle>
    ) {}

    async performAs(
        actor: UsesAbilities & AnswersQuestions & PerformsActivities
    ): Promise<void> {
        const option = await actor.answer(this.option);
        const picklist = await actor.answer(this.target);
        await picklist.selectOption({ label: option });
    }

    toString() {
        return formatted`#actor selects ${this.option} from ${this.target}`;
    }
}

/**
 * @package
 */
class SelectOptions implements Interaction {
    constructor(
        private readonly values: Array<Answerable<string[] | string>>,
        private readonly target: Answerable<ElementHandle>
    ) {}

    async performAs(
        actor: UsesAbilities & AnswersQuestions & PerformsActivities
    ): Promise<void> {
        const values = await Promise.all(this.values.map(actor.answer));
        const picklist = await actor.answer(this.target);
        await picklist.selectOption(flatten(values).map((label) => ({ label })));
    }

    toString() {
        return `#actor selects ${commaSeparated(
            flatten(this.values),
            inspected
        )} from ${this.target}`;
    }
}

/** @package */
const flatten = <T>(listOfLists: Array<T[] | T>): T[] => {
    return listOfLists
    .map((item) => [].concat(item))
    .reduce((acc: T[], list: T[]) => acc.concat(list), []);
};
