/**
 * An [`Activity`](https://serenity-js.org/api/core/class/Activity/) implementing `IsSilent` has its own step,
 * **and every nested activity it performs**, omitted from the report. Use it for setup or teardown activities
 * whose reporting would only add noise.
 *
 * The `isSilent()` method allows silence to be decided dynamically.
 *
 * Inspired by Serenity BDD's `net.serenitybdd.markers.IsSilent` and its `CanBeSilent` companion.
 *
 * @group Screenplay Pattern
 */
export interface IsSilent {
    /**
     * Returns `true` when this activity's own step, and everything nested under it, should be omitted from the report.
     */
    isSilent(): boolean;
}

/**
 * Returns `true` when the given `activity` declares itself as {@apilink IsSilent}.
 */
export function isSilent(activity: unknown): boolean {
    return Boolean(activity)
        && typeof (activity as IsSilent).isSilent === 'function'
        && (activity as IsSilent).isSilent();
}
