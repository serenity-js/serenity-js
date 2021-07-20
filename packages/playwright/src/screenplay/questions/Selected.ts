import {
    Answerable,
    AnswersQuestions,
    Question,
    UsesAbilities,
} from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import {
    ElementHandleAnswer,
} from '../../answerTypes/ElementHandleAnswer';
import { BrowseTheWeb } from '../abilities';

interface Option {
    value: string;
    label: string;
}

/**
 * @desc
 *  Represents options and values selected in a
 *  [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select).
 *
 * @see {@link Select}
 */
export class Selected {
    /**
   * @desc
   *  Represents the value of a single option selected in a
   *  [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select).
   *
   * @example <caption>Example widget</caption>
   *  <select data-test='countries'>
   *      <option value='UK'>United Kingdom</option>
   *      <option value='PL'>Poland</option>
   *      <option value='US'>United States</option>
   *  </select>
   *
   * @example <caption>Lean Page Object</caption>
   *  import { Target } from '@serenity-js/playwright';
   *
   *  class Countries {
   *      static dropdown = Target.the('countries dropdown')
   *          .located('data-test=countries'));
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
   * @param {Answerable<ElementHandleAnswer>} target
   *  A {@link Target} identifying the `<select>` element of interest
   *
   * @returns {Question<Promise<string>>}
   *
   * @see {@link Select.value}
   */
    static valueOf(
        target: Answerable<ElementHandleAnswer>
    ): Question<Promise<string>> {
        return new SelectedValue(target);
    }

    /**
   * @desc
   *  Represents values of options selected in a
   *  [HTML `<select multiple>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#attr-multiple)
   *
   * @example <caption>Example widget</caption>
   *  <select multiple data-test='countries'>
   *      <option value='UK'>United Kingdom</option>
   *      <option value='PL'>Poland</option>
   *      <option value='US'>United States</option>
   *  </select>
   *
   * @example <caption>Lean Page Object</caption>
   *  import { Target } from '@serenity-js/playwright';
   *
   *  class Countries {
   *      static dropdown = Target.the('countries dropdown')
   *          .located('data-test=countries');
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
   * @param {Answerable<ElementHandleAnswer>} target
   *  A {@link Target} identifying the `<select>` element of interest
   *
   * @returns {Question<Promise<string[]>>}
   *
   * @see {@link Select.values}
   */
    static valuesOf(
        target: Answerable<ElementHandleAnswer>
    ): Question<Promise<string[]>> {
        return new SelectedValues(target);
    }

    /**
   * @desc
   *  Represents a single option selected in a
   *  [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#attr-multiple)
   *
   * @example <caption>Example widget</caption>
   *  <select data-test='countries'>
   *      <option value='UK'>United Kingdom</option>
   *      <option value='PL'>Poland</option>
   *      <option value='US'>United States</option>
   *  </select>
   *
   * @example <caption>Lean Page Object</caption>
   *  import { Target } from '@serenity-js/playwright';
   *
   *  class Countries {
   *      static dropdown = Target.the('countries dropdown')
   *          .located('data-test=countries');
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
   * @param {Answerable<ElementHandleAnswer>} target
   *  A {@link Target} identifying the `<select>` element of interest
   *
   * @returns {Question<Promise<string>>}
   *
   * @see {@link Select.option}
   */
    static optionIn(
        target: Answerable<ElementHandleAnswer>
    ): Question<Promise<string>> {
        return new SelectedOptionLabel(target);
    }

    /**
   * @desc
   *  Represents options selected in a
   *  [HTML `<select multiple>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#attr-multiple)
   *
   * @example <caption>Example widget</caption>
   *  <select multiple data-test='countries'>
   *      <option value='UK'>United Kingdom</option>
   *      <option value='PL'>Poland</option>
   *      <option value='US'>United States</option>
   *  </select>
   *
   * @example <caption>Lean Page Object</caption>
   *  import { Target } from '@serenity-js/playwright';
   *
   *  class Countries {
   *      static dropdown = Target.the('countries dropdown')
   *          .located('data-test=countries');
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
   * @param {Answerable<ElementHandleAnswer>} target
   *  A {@link Target} identifying the `<select>` element of interest
   *
   * @returns {Question<Promise<string[]>>}
   *
   * @see {@link Select.options}
   */
    static optionsIn(
        target: Answerable<ElementHandleAnswer>
    ): Question<Promise<string[]>> {
        return new SelectedOptionLabels(target);
    }
}

/**
 * @package
 */
class SelectedValue extends Question<Promise<string>> {
    constructor(private readonly target: Answerable<ElementHandleAnswer>) {
        super(formatted`value selected in ${target}`);
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        const selectedOptions = await actor.answer(SelectedOptions.of(this.target));
        return (selectedOptions[0] as any).value;
    }
}

/**
 * @package
 */
class SelectedValues extends Question<Promise<string[]>> {
    constructor(private readonly target: Answerable<ElementHandleAnswer>) {
        super(formatted`values selected in ${target}`);
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
        const selectedOptions = await actor.answer(SelectedOptions.of(this.target));
        return selectedOptions.map((option: any) => option.value);
    }
}

/**
 * @package
 */
class SelectedOptionLabel extends Question<Promise<string>> {
    constructor(private target: Answerable<ElementHandleAnswer>) {
        super(formatted`option selected in ${target}`);
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        const options = await SelectedOptions.of(this.target).answeredBy(actor);
        return (options[0] as any).label;
    }
}

/**
 * @package
 */
class SelectedOptionLabels extends Question<Promise<string[]>> {
    constructor(private target: Answerable<ElementHandleAnswer>) {
        super(formatted`options selected in ${target}`);
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
        const selectedOptions = await actor.answer(SelectedOptions.of(this.target));
        return selectedOptions.map((option: any) => option.label);
    }
}

/**
 * @package
 */
class SelectedOptions extends Question<Promise<Option[]>> {
    static of(target: Answerable<ElementHandleAnswer>) {
        return new SelectedOptions(target);
    }

    protected constructor(private target: Answerable<ElementHandleAnswer>) {
        super(formatted`options selected in ${target}`);
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Option[]> {
        const element = await actor.answer(this.target);
        const selectedOptions = await actor
      .abilityTo(BrowseTheWeb)
      .evaluate((element: any) => {
          return Array.from(element.selectedOptions).map((opt: any) => ({
              value: opt.value,
              label: opt.label,
          }));
      }, element);
        return selectedOptions;
    }
}
