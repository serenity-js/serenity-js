/**
 * An interface to be implemented by any {@link Ability} that needs to initialise
 * the resources it uses, e.g. establish a database connection.
 *
 * The [[Initialisable.initialise]] method is invoked whenever [[Actor.attemptsTo]] method is called,
 * but **only when** [[Initialisable.isInitialised]] returns false. This is to avoid initialising abilities more than once.
 *
 * ## Learn more
 * - {@link Ability}
 * - {@link AbilityType}
 * - {@link Discardable}
 *
 * @group Abilities
 */
export interface Initialisable {

    /**
     * Initialises the ability. Invoked whenever [[Actor.attemptsTo]] method is called,
     * but **only when** [[Initialisable.isInitialised]] returns false.
     *
     * Make sure to implement [[Initialisable.isInitialised]] so that it returns `true`
     * when the ability has been successfully initialised.
     */
    initialise(): Promise<void> | void;

    /**
     * Should return `true` when all the resources that the given ability needs
     * have been initialised. Should return `false` if the {@link Actor} should
     * initialise them again when [[Actor.attemptsTo]] is called.
     *
     * @returns {boolean}
     */
    isInitialised(): boolean;
}
