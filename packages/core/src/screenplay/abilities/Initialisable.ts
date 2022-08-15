/**
 * An interface to be implemented by any {@apilink Ability} that needs to initialise
 * the resources it uses, e.g. establish a database connection.
 *
 * The {@apilink Initialisable.initialise} method is invoked whenever {@apilink Actor.attemptsTo} method is called,
 * but **only when** {@apilink Initialisable.isInitialised} returns false. This is to avoid initialising abilities more than once.
 *
 * ## Learn more
 * - {@apilink Ability}
 * - {@apilink AbilityType}
 * - {@apilink Discardable}
 *
 * @group Abilities
 */
export interface Initialisable {

    /**
     * Initialises the ability. Invoked whenever {@apilink Actor.attemptsTo} method is called,
     * but **only when** {@apilink Initialisable.isInitialised} returns false.
     *
     * Make sure to implement {@apilink Initialisable.isInitialised} so that it returns `true`
     * when the ability has been successfully initialised.
     */
    initialise(): Promise<void> | void;

    /**
     * Should return `true` when all the resources that the given ability needs
     * have been initialised. Should return `false` if the {@apilink Actor} should
     * initialise them again when {@apilink Actor.attemptsTo} is called.
     *
     * @returns {boolean}
     */
    isInitialised(): boolean;
}
