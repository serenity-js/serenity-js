import { SwitchableOrigin } from './SwitchableOrigin';

/**
 * @desc
 *  Describes a Serenity/JS model object that can be switched to and switched back from
 *  using the {@link @serenity-js/core/lib/screenplay~Task} to {@link Switch}.
 *
 *  Examples of switchable models include a {@link Page} and {@link PageElement}.
 *
 * @public
 * @interface
 *
 * @see {@link Page}
 * @see {@link PageElement}
 * @see {@link Switch}
 */
export interface Switchable {

    /**
     * @desc
     *  Switches the context to the object implementing this interface
     *  and returns {@link SwitchableOrigin} that allows for the context to be switched
     *  back when needed.
     *
     * @type {function(): Promise<SwitchableOrigin>}
     * @public
     */
    switchTo: () => Promise<SwitchableOrigin>;
}
