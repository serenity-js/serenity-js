import { Selector } from './Selector';

/**
 * @group Models
 */
export type ByRoleSelectorValue =
    | 'alert'
    | 'alertdialog'
    | 'application'
    | 'article'
    | 'banner'
    | 'blockquote'
    | 'button'
    | 'caption'
    | 'cell'
    | 'checkbox'
    | 'code'
    | 'columnheader'
    | 'combobox'
    | 'complementary'
    | 'contentinfo'
    | 'definition'
    | 'deletion'
    | 'dialog'
    | 'directory'
    | 'document'
    | 'emphasis'
    | 'feed'
    | 'figure'
    | 'form'
    | 'generic'
    | 'grid'
    | 'gridcell'
    | 'group'
    | 'heading'
    | 'img'
    | 'insertion'
    | 'link'
    | 'list'
    | 'listbox'
    | 'listitem'
    | 'log'
    | 'main'
    | 'marquee'
    | 'math'
    | 'meter'
    | 'menu'
    | 'menubar'
    | 'menuitem'
    | 'menuitemcheckbox'
    | 'menuitemradio'
    | 'navigation'
    | 'none'
    | 'note'
    | 'option'
    | 'paragraph'
    | 'presentation'
    | 'progressbar'
    | 'radio'
    | 'radiogroup'
    | 'region'
    | 'row'
    | 'rowgroup'
    | 'rowheader'
    | 'scrollbar'
    | 'search'
    | 'searchbox'
    | 'separator'
    | 'slider'
    | 'spinbutton'
    | 'status'
    | 'strong'
    | 'subscript'
    | 'superscript'
    | 'switch'
    | 'tab'
    | 'table'
    | 'tablist'
    | 'tabpanel'
    | 'term'
    | 'textbox'
    | 'time'
    | 'timer'
    | 'toolbar'
    | 'tooltip'
    | 'tree'
    | 'treegrid'
    | 'treeitem'

/**
 * Locates a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) by its [ARIA role](https://www.w3.org/TR/wai-aria-1.2/#roles),
 * [ARIA attributes](https://www.w3.org/TR/wai-aria-1.2/#aria-attributes) and [accessible name](https://w3c.github.io/accname/#dfn-accessible-name).
 *
 * **Pro tip:** Instantiate using [`By.role`](https://serenity-js.org/api/web/class/By/#role)
 *
 * @group Models
 */
export class ByRole extends Selector {
    constructor(public readonly value: ByRoleSelectorValue, public readonly options: ByRoleSelectorOptions) {
        super();
    }
}

/**
 * @group Models
 */
export interface ByRoleSelectorOptions {

    /**
     * An attribute that is usually set by [`aria-checked`](https://www.w3.org/TR/wai-aria-1.2/#aria-checked) or
     * native `<input type=checkbox>` controls.
     *
     * :::tip Playwright only
     * This property is supported only by Playwright.
     * :::
     */
    checked?: boolean;

    /**
     * An attribute that is usually set by `aria-disabled` or `disabled`.
     *
     * **NOTE** Unlike most other attributes, `disabled` is inherited through the DOM hierarchy. Learn more about
     * [`aria-disabled`](https://www.w3.org/TR/wai-aria-1.2/#aria-disabled).
     *
     * :::tip Playwright only
     * This property is supported only by Playwright.
     * :::
     */
    disabled?: boolean;

    /**
     * Whether [`name`](https://serenity-js.org/api/web/interface/ByRoleSelectorOptions/#name) is matched exactly:
     * case-sensitive and whole-string.
     *
     * :::tip Playwright matching defaults
     * Playwright defaults to `false` for backwards compatibility, but we recommend setting this property to `true`
     * to avoid unintentional matches.
     * :::
     *
     * :::tip Playwright and name RegExp
     * Playwright supports using a `RegExp` to match the name.
     * When using a `RegExp`, exact matching is not applicable and this option is ignored.
     * Note that **exact match still trims whitespace**.
     * :::
     *
     * :::tip WebdriverIO
     * WebdriverIO always performs exact matching, so this option is ignored.
     * :::
     */
    exact?: boolean;

    /**
     * An attribute that is usually set by `aria-expanded`.
     *
     * Learn more about [`aria-expanded`](https://www.w3.org/TR/wai-aria-1.2/#aria-expanded).
     *
     * :::tip Playwright only
     * This property is supported only by Playwright.
     * :::
     */
    expanded?: boolean;

    /**
     * Option that controls whether hidden elements are matched. By default, only non-hidden elements, as
     * [defined by ARIA](https://www.w3.org/TR/wai-aria-1.2/#tree_exclusion), are matched by role selector.
     *
     * Learn more about [`aria-hidden`](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden).
     *
     * :::tip Playwright only
     * This property is supported only by Playwright.
     * :::
     */
    includeHidden?: boolean;

    /**
     * A number attribute that is usually present for roles `heading`, `listitem`, `row`, `treeitem`, with default values
     * for `<h1>-<h6>` elements.
     *
     * Learn more about [`aria-level`](https://www.w3.org/TR/wai-aria-1.2/#aria-level).
     *
     * :::tip Playwright only
     * This property is supported only by Playwright.
     * :::
     */
    level?: number;

    /**
     * Option to match the [accessible name](https://w3c.github.io/accname/#dfn-accessible-name).
     *
     * :::tip Playwright
     * Only Playwright supports using a `RegExp` to match the name. When using a `string` instead, Playwright performs
     * a **case-insensitive** match and searches for a **substring**. Use
     * [`exact`](https://serenity-js.org/api/web/interface/ByRoleSelectorOptions/#exact) to control this behavior.
     * :::
     *
     * :::tip WebdriverIO
     * WebdriverIO does not support using `RegExp` and performs a **case-sensitive** and **exact** matching.
     * :::
     */
    name?: string | RegExp;

    /**
     * An attribute that is usually set by [`aria-pressed`](https://www.w3.org/TR/wai-aria-1.2/#aria-pressed).
     *
     * :::tip Playwright only
     * This property is supported only by Playwright.
     * :::
     */
    pressed?: boolean;

    /**
     * An attribute that is usually set by [`aria-selected`](https://www.w3.org/TR/wai-aria-1.2/#aria-selected).
     *
     * :::tip Playwright only
     * This property is supported only by Playwright.
     * :::
     */
    selected?: boolean;
}
