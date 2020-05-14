/**
 * @desc
 *  An interface to be implemented by any {@link Ability} that needs to free up
 *  any resources it's using when the test scenario finishes.
 *
 * @public
 */
export interface Discardable {
    discard(): Promise<void> | void;
}
