import type { SwitchableOrigin } from './SwitchableOrigin';

/**
 * Describes a Serenity/JS model object that can be switched _to_ and switched back _from_
 * using the {@apilink Task|task} to {@apilink Switch}.
 *
 * Examples of switchable models include a {@apilink Page} and {@apilink PageElement}.
 *
 * ## Learn more
 * - {@apilink Page}
 * - {@apilink PageElement}
 * - {@apilink Switch}
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
