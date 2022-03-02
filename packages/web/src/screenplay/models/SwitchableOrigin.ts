/**
 * @desc
 *  Allows the {@link Task} to {@link Switch} to perform a sequence of activities
 *  and switch back to the original context afterwards.
 *
 * @public
 * @interface
 *
 * @see {@link Switch}
 * @see {@link Switchable}
 */
export interface SwitchableOrigin {

    /**
     * @desc
     *  Switches the context back to the original {@link Switchable}
     *
     * @type {function(): Promise<void>}
     * @public
     */
    switchBack: () => Promise<void>;
}
