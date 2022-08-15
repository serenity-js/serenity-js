/**
 * An interface to be implemented by any {@apilink Ability} that needs to free up
 * the resources it uses, e.g. disconnect from a database.
 *
 * This {@apilink Discardable.discard} method is invoked directly by the {@apilink Actor}, and indirectly by {@apilink Stage}:
 * - when {@apilink SceneFinishes}, for actors instantiated after {@apilink SceneStarts} - e.g. within a test scenario or in a "before each" hook
 * - when {@apilink TestRunFinishes}, for actors instantiated before {@apilink SceneStarts} - e.g. in a "before all" hook
 *
 * Note that events such as {@apilink SceneFinishes} and {@apilink TestRunFinishes} are emitted by Serenity/JS test runner adapters,
 * such as `@serenity-js/cucumber`, `@serenity-js/mocha`, `@serenity-js/jasmine`, and so on.
 * Consult their respective readmes to learn how to register them with your test runner of choice.
 *
 * ## Learn more
 * - {@apilink Ability}
 * - {@apilink AbilityType}
 * - {@apilink Initialisable}
 *
 * @group Abilities
 */
export interface Discardable {

    /**
     * Discards the resources associated with this ability.
     */
    discard(): Promise<void> | void;
}
