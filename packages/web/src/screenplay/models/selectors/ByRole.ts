import { Selector } from './Selector';

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

export class ByRole extends Selector {
    constructor(public readonly value: ByRoleSelectorValue, public readonly options: ByRoleSelectorOptions) {
        super();
    }
}

export interface ByRoleSelectorOptions {

    /**
     * An attribute that is usually set by `aria-checked` or native `<input type=checkbox>` controls.
     *
     * Learn more about [`aria-checked`](https://www.w3.org/TR/wai-aria-1.2/#aria-checked).
     */
    checked?: boolean;

    /**
     * An attribute that is usually set by `aria-disabled` or `disabled`.
     *
     * **NOTE** Unlike most other attributes, `disabled` is inherited through the DOM hierarchy. Learn more about
     * [`aria-disabled`](https://www.w3.org/TR/wai-aria-1.2/#aria-disabled).
     *
     */
    disabled?: boolean;

    /**
     * Whether [`name`](https://playwright.dev/docs/api/class-page#page-get-by-role-option-name) is matched exactly:
     * case-sensitive and whole-string. Defaults to false. Ignored when
     * [`name`](https://playwright.dev/docs/api/class-page#page-get-by-role-option-name) is a regular expression. Note
     * that exact match still trims whitespace.
     */
    exact?: boolean;

    /**
     * An attribute that is usually set by `aria-expanded`.
     *
     * Learn more about [`aria-expanded`](https://www.w3.org/TR/wai-aria-1.2/#aria-expanded).
     */
    expanded?: boolean;

    /**
     * Option that controls whether hidden elements are matched. By default, only non-hidden elements, as
     * [defined by ARIA](https://www.w3.org/TR/wai-aria-1.2/#tree_exclusion), are matched by role selector.
     *
     * Learn more about [`aria-hidden`](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden).
     */
    includeHidden?: boolean;

    /**
     * A number attribute that is usually present for roles `heading`, `listitem`, `row`, `treeitem`, with default values
     * for `<h1>-<h6>` elements.
     *
     * Learn more about [`aria-level`](https://www.w3.org/TR/wai-aria-1.2/#aria-level).
     */
    level?: number;

    /**
     * Option to match the [accessible name](https://w3c.github.io/accname/#dfn-accessible-name). By default, matching is
     * case-insensitive and searches for a substring, use
     * [`exact`](https://playwright.dev/docs/api/class-page#page-get-by-role-option-exact) to control this behavior.
     *
     * Learn more about [accessible name](https://w3c.github.io/accname/#dfn-accessible-name).
     */
    name?: string | RegExp;

    /**
     * An attribute that is usually set by `aria-pressed`.
     *
     * Learn more about [`aria-pressed`](https://www.w3.org/TR/wai-aria-1.2/#aria-pressed).
     */
    pressed?: boolean;

    /**
     * An attribute that is usually set by `aria-selected`.
     *
     * Learn more about [`aria-selected`](https://www.w3.org/TR/wai-aria-1.2/#aria-selected).
     */
    selected?: boolean;
}
