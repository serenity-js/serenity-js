import type { Activity, Answerable } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { Click, type PageElement } from '@serenity-js/web';

/**
 * The part of a view that holds its controls, such as search, filters, and sort.
 *
 * On wider screens, the controls are shown inline. On mobile, they're shown in a bottom sheet,
 * which needs to be opened before the controls can be used, and closed afterwards.
 * Views render a separate copy of each control in the sheet, so interaction objects
 * also need to pick the right copy of the control to interact with.
 *
 * `ViewControls` keeps this mobile-specific behaviour in one place,
 * so that interaction objects don't need to check the viewport themselves.
 *
 * ## Usage within an interaction object
 *
 * ```ts
 * private readonly viewControls = new ViewControls(
 *     this.rootElement.element(By.css('[aria-label="Search and filter"]')),
 *     this.rootElement.element(By.css('[data-testid="bottom-sheet"] .bottom-sheet-close')),
 *     this.mobile,
 * );
 *
 * selectFilter = (label: Answerable<string>): Task => {
 *     const filterBar = this.viewControls.pick(this.filterBar, this.mobileFilterBar);
 *
 *     return Task.where(the`#actor selects the ${ label } filter`,
 *         ...this.viewControls.within(
 *             filterBar.selectFilter(label),
 *         ),
 *     );
 * };
 * ```
 *
 * @package
 */
export class ViewControls<NET> {

    /**
     * @param sheetTrigger
     *  The button that opens the bottom sheet with the controls on mobile
     * @param sheetCloseButton
     *  The button that closes the bottom sheet
     * @param mobile
     *  Whether the view is rendered for a mobile viewport
     */
    constructor(
        private readonly sheetTrigger: Answerable<PageElement<NET>>,
        private readonly sheetCloseButton: Answerable<PageElement<NET>>,
        private readonly mobile: boolean,
    ) {
    }

    /**
     * Picks the copy of a control rendered for the current viewport:
     * the one in the bottom sheet on mobile, or the inline one otherwise.
     *
     * @param inline
     *  The control shown inline on wider screens
     * @param inSheet
     *  The control shown in the bottom sheet on mobile
     */
    pick = <Control>(inline: Control, inSheet: Control): Control =>
        this.mobile ? inSheet : inline;

    /**
     * Returns the activities to perform while the controls are available:
     * on mobile, wrapped in opening and closing the bottom sheet, otherwise as they are.
     *
     * @param activities
     */
    within = (...activities: Activity[]): Activity[] =>
        this.mobile
            ? [ this.openSheet(), ...activities, this.closeSheet() ]
            : activities;

    private openSheet = (): Task =>
        Task.where('#actor opens the view controls',
            Click.on(this.sheetTrigger),
        );

    private closeSheet = (): Task =>
        Task.where('#actor closes the view controls',
            Click.on(this.sheetCloseButton),
        );
}
