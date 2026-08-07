/**
 * An [`Activity`](https://serenity-js.org/api/core/class/Activity/) implementing `IsHidden` has its own step
 * omitted from the report, while any nested activities it performs are still reported.
 *
 * For example, [`Check`](https://serenity-js.org/api/core/class/Check/) implements `IsHidden` so that the conditional
 * check itself doesn't clutter the report, while the activities it decides to perform still do.
 *
 * Inspired by Serenity BDD's `net.serenitybdd.markers.IsHidden`.
 *
 * @group Screenplay Pattern
 */
export interface IsHidden {
    /**
     * Returns `true` when this activity's own step should be omitted from the report.
     * Nested activities are still reported.
     */
    isHidden(): boolean;
}

/**
 * Returns `true` when the given `activity` declares itself as {@apilink IsHidden}.
 */
export function isHidden(activity: unknown): boolean {
    return Boolean(activity)
        && typeof (activity as IsHidden).isHidden === 'function'
        && (activity as IsHidden).isHidden();
}
