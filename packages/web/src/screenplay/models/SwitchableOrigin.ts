/**
 * Enables the {@apilink Task} to {@apilink Switch} to perform a sequence of activities
 * and switch back to the original context afterwards.
 *
 * ## Learn more
 *
 * - {@apilink Switch}
 * - {@apilink Switchable}
 *
 * @group Models
 */
export interface SwitchableOrigin {

    /**
     * Switches the context back to the original {@apilink Switchable}
     */
    switchBack(): Promise<void>;
}
