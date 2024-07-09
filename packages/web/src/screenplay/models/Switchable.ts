import type { SwitchableOrigin } from './SwitchableOrigin';

/**
 * Describes a Serenity/JS model object that can be switched _to_ and switched back _from_
 * using the [task](https://serenity-js.org/api/core/class/Task/) to [`Switch`](https://serenity-js.org/api/web/class/Switch/).
 *
 * Examples of switchable models include a [`Page`](https://serenity-js.org/api/web/class/Page/) and [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
 *
 * ## Learn more
 * - [`Page`](https://serenity-js.org/api/web/class/Page/)
 * - [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
 * - [`Switch`](https://serenity-js.org/api/web/class/Switch/)
 *
 * @group Models
 */
export interface Switchable {

    /**
     * Switches the context to the object implementing this interface
     * and returns [`SwitchableOrigin`](https://serenity-js.org/api/web/interface/SwitchableOrigin/) that allows for the context to be switched
     * back when needed.
     */
    switchTo(): Promise<SwitchableOrigin>;
}
