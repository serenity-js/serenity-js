/**
 * An interface to be implemented by any {@link Ability} that needs to free up
 * the resources it uses, e.g. disconnect from a database.
 *
 * This {@apilink Discardable.discard} method is invoked directly by the {@link Actor}, and indirectly by {@link Stage}:
 * - when {@link SceneFinishes}, for actors instantiated after {@link SceneStarts} - e.g. within a test scenario or in a "before each" hook
 * - when {@link TestRunFinishes}, for actors instantiated before {@link SceneStarts} - e.g. in a "before all" hook
 *
 * Note that events such as {@link SceneFinishes} and {@link TestRunFinishes} are emitted by Serenity/JS test runner adapters,
 * such as `@serenity-js/cucumber`, `@serenity-js/mocha`, `@serenity-js/jasmine`, and so on.
 * Consult their respective readmes to learn how to register them with your test runner of choice.
 *
 * ## Learn more
 * - {@link Ability}
 * - {@link AbilityType}
 * - {@link Initialisable}
 *
 * @group Abilities
 */
export interface Discardable {

    /**
     * Discards the resources associated with this ability.
     */
    discard(): Promise<void> | void;
}
