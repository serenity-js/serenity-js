/**
 * Enables the [`Task`](https://serenity-js.org/api/core/class/Task/) to [`Switch`](https://serenity-js.org/api/web/class/Switch/) to perform a sequence of activities
 * and switch back to the original context afterwards.
 *
 * ## Learn more
 *
 * - [`Switch`](https://serenity-js.org/api/web/class/Switch/)
 * - [`Switchable`](https://serenity-js.org/api/web/interface/Switchable/)
 *
 * @group Models
 */
export interface SwitchableOrigin {

    /**
     * Switches the context back to the original [`Switchable`](https://serenity-js.org/api/web/interface/Switchable/)
     */
    switchBack(): Promise<void>;
}
