/**
 * Enables the {@link Task} to {@link Switch} to perform a sequence of activities
 * and switch back to the original context afterwards.
 *
 * ## Learn more
 *
 * - {@link Switch}
 * - {@link Switchable}
 *
 * @group Models
 */
export interface SwitchableOrigin {

    /**
     * Switches the context back to the original {@link Switchable}
     */
    switchBack(): Promise<void>;
}
