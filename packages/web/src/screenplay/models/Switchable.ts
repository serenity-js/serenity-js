import { SwitchableOrigin } from './SwitchableOrigin';

/**
 * Describes a Serenity/JS model object that can be switched _to_ and switched back _from_
 * using the {@link Task|task} to {@link Switch}.
 *
 * Examples of switchable models include a {@link Page} and {@link PageElement}.
 *
 * ## Learn more
 * - {@link Page}
 * - {@link PageElement}
 * - {@link Switch}
 *
 * @group Models
 */
export interface Switchable {

    /**
     * Switches the context to the object implementing this interface
     * and returns {@apilink SwitchableOrigin} that allows for the context to be switched
     * back when needed.
     */
    switchTo(): Promise<SwitchableOrigin>;
}
