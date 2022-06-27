/**
 * @desc
 *  An interface to be implemented by any {@link Ability} that needs to free up
 *  the resources it uses.
 *
 *  This {@link discard} method is invoked directly by the {@link Actor}, and indirectly by {@link Stage}:
 *  - when {@link SceneFinishes}, for actors instantiated after {@link SceneStarts} - i.e. within a test scenario or in a "before each" hook
 *  - when {@link TestRunFinishes}, for actors instantiated before {@link SceneStarts} - i.e. in a "before all" hook
 *
 * @public
 */
export interface Discardable {

    /**
     * @desc
     *  Discards the resources associated with this ability.
     *
     * @type {function(): Promise<void>|void}
     * @public
     */
    discard: () => Promise<void> | void;
}
