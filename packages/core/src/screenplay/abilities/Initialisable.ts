/**
 * @desc
 *  An interface to be implemented by any {@link Ability} that needs to initialise
 *  the resources it uses (i.e. establish a database connection).
 *
 *  The {@link initialise} method is invoked when {@link Actor#attemptsTo} is called,
 *  but only when {@link isInitialised} returns false.
 *
 * @public
 */
export interface Initialisable {

    /**
     * @desc
     *  Initialises the ability. Invoked when {@link Actor#attemptsTo} is called,
     *  but only when {@link isInitialised} returns false.
     *
     *  Make sure to implement {@link isInitialised} so that it returns `true`
     *  when the ability has been successfully initialised.
     *
     * @returns {Promise<void> | void}
     */
    initialise(): Promise<void> | void;

    /**
     * @desc
     *  Whether or not a given ability has been initialised already
     *  and should not be initialised again.
     *
     * @returns {boolean}
     */
    isInitialised(): boolean;
}
