/**
 * @desc
 *  Describes a model that can be switched to and switched back from.
 *  For example, a {@link Page} or {@link Frame}.
 *
 * @public
 */
export interface Switchable {
    switchTo(): Promise<{
        switchBack(): Promise<void>
    }>;
}
