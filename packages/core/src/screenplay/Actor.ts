import { ConfigurationError, TestCompromisedError } from '../errors';
import { ActivityRelatedArtifactGenerated } from '../events';
import { typeOf } from '../io';
import type { Artifact} from '../model';
import { Name, } from '../model';
import type { Stage } from '../stage';
import type {
    AbilityType,
    CanHaveAbilities,
    Discardable,
    Initialisable,
    UsesAbilities
} from './abilities';
import {
    Ability,
    AnswerQuestions,
    PerformActivities
} from './abilities';
import type { PerformsActivities } from './activities';
import type { Activity } from './Activity';
import type { Answerable } from './Answerable';
import type { CollectsArtifacts } from './artifacts';
import type { AnswersQuestions } from './questions';
import type { TellsTime, Timestamp } from './time';

/**
 * **Actors** represent **people** and **external systems** interacting with the system under test.
 * Their role is to perform {@apilink Activity|activities} that demonstrate how to accomplish a given goal.
 *
 * Actors are the core building block of the [Screenplay Pattern](/handbook/design/screenplay-pattern),
 * along with {@apilink Ability|Abilities}, {@apilink Interaction|Interactions}, {@apilink Task|Tasks}, and {@apilink Question|Questions}.
 * Actors are also the first thing you see in a typical Serenity/JS test scenario.
 *
 * ![Screenplay Pattern](/images/design/serenity-js-screenplay-pattern.png)
 *
 * Learn more about:
 * - {@apilink Cast}
 * - {@apilink Stage}
 * - {@apilink Ability|Abilities}
 * - {@apilink Activity|Activities}
 * - {@apilink Interaction|Interactions}
 * - {@apilink Task|Tasks}
 * - {@apilink Question|Questions}
 *
 * ## Representing people and systems as actors
 *
 * To use a Serenity/JS {@apilink Actor}, all you need is to say their name:
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core'
 *
 * actorCalled('Alice')
 * // returns: Actor
 * ```
 *
 * Serenity/JS actors perform within the scope of a test scenario, so the first time you invoke {@apilink actorCalled},
 * Serenity/JS instantiates a new actor from the default {@apilink Cast} of actors (or any custom cast you might have {@apilink configured|configured}).
 * Any subsequent invocations of this function within the scope of the same test scenario retrieve the already instantiated actor, identified by their name.
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core'
 *
 * actorCalled('Alice')    // instantiates Alice
 * actorCalled('Bob')      // instantiates Bob
 * actorCalled('Alice')    // retrieves Alice, since she's already been instantiated
 * ```
 *
 * Serenity/JS scenarios can involve as many or as few actors as you need to model the given business workflow.
 * For example, you might want to use **multiple actors** in test scenarios that model how **different people** perform different parts of a larger business process, such as reviewing and approving a loan application.
 * It is also quite common to introduce **supporting actors** to perform **administrative tasks**, like setting up test data and environment, or **audit tasks**, like checking the logs or messages emitted to a message queue
 * by the system under test.
 *
 * :::info The Stan Lee naming convention
 * Actor names can be much more than just simple identifiers like `Alice` or `Bob`. While you can give your actors any names you like, a good convention to follow is to give them
 * names indicating the [personae](https://articles.uie.com/goodwin_interview/) they represent or the role they play in the system.
 *
 * Just like the characters in [Stan Lee](https://en.wikipedia.org/wiki/Stan_Lee) graphic novels,
 * actors in Serenity/JS test scenarios are often given alliterate names as a mnemonic device.
 * Names like "Adam the Admin", "Edna the Editor", "Trevor the Traveller", are far more memorable than a generic "UI user" or "API user".
 * They're also much easier for people to associate with the context, constraints, and affordances of the given actor.
 * :::
 *
 * @group Screenplay Pattern
 */
export class Actor implements PerformsActivities,
    UsesAbilities,
    CanHaveAbilities<Actor>,
    AnswersQuestions,
    CollectsArtifacts,
    TellsTime
{
    private readonly abilities: Map<AbilityType<Ability>, Ability> = new Map<AbilityType<Ability>, Ability>();

    constructor(
        public readonly name: string,
        private readonly stage: Stage,
        abilities: Ability[] = [],
    ) {
        [
            new PerformActivities(this, stage),
            new AnswerQuestions(this),
            ...abilities
        ].forEach(ability => this.acquireAbility(ability));
    }

    /**
     * Retrieves actor's {@apilink Ability} of `abilityType`, or one that extends `abilityType`.
     *
     * Please note that this method performs an {@apilink instanceof} check against abilities
     * given to this actor via {@apilink Actor.whoCan}.
     *
     * Please also note that {@apilink Actor.whoCan} performs the same check when abilities are assigned to the actor
     * to ensure the actor has at most one instance of a given ability type.
     *
     * @param abilityType
     */
    abilityTo<T extends Ability>(abilityType: AbilityType<T>): T {
        const found = this.findAbilityTo(abilityType);

        if (! found) {
            throw new ConfigurationError(
                `${ this.name } can ${ Array.from(this.abilities.keys()).map(type => type.name).join(', ') }. ` +
                `They can't, however, ${ abilityType.name } yet. ` +
                `Did you give them the ability to do so?`
            );
        }

        return found;
    }

    /**
     * Instructs the actor to attempt to perform a number of {@apilink Activity|activities},
     * so either {@apilink Task|Tasks} or {@apilink Interaction|Interactions}),
     * one by one.
     *
     * @param {...activities: Activity[]} activities
     */
    attemptsTo(...activities: Activity[]): Promise<void> {
        return activities
            .reduce((previous: Promise<void>, current: Activity) => {
                return previous
                    .then(() => PerformActivities.as(this).perform(current));
            }, this.initialiseAbilities());
    }

    /**
     * Gives this Actor a list of {@apilink Ability|abilities} they can use
     * to interact with the system under test or the test environment.
     *
     * @param abilities
     *  A vararg list of abilities to give the actor
     *
     * @returns
     *  The actor with newly gained abilities
     *
     * @throws {@apilink ConfigurationError}
     *  Throws a ConfigurationError if the actor already has an ability of this type.
     */
    whoCan(...abilities: Ability[]): Actor {
        abilities.forEach(ability => this.acquireAbility(ability));

        return this;
    }

    /**
     * @param answerable -
     *  An {@apilink Answerable} to answer (resolve the value of).
     *
     * @returns
     *  The answer to the Answerable
     */
    answer<T>(answerable: Answerable<T>): Promise<T> {
        return AnswerQuestions.as(this).answer(answerable);
    }

    /**
     * @inheritDoc
     */
    collect(artifact: Artifact, name?: string | Name): void {
        this.stage.announce(new ActivityRelatedArtifactGenerated(
            this.stage.currentSceneId(),
            this.stage.currentActivityId(),
            this.nameFrom(name || new Name(artifact.constructor.name)),
            artifact,
            this.stage.currentTime(),
        ));
    }

    /**
     * Returns current time.
     */
    currentTime(): Timestamp {
        return this.stage.currentTime();
    }

    /**
     * Instructs the actor to invoke {@apilink Discardable.discard} method on any
     * {@apilink Discardable} {@apilink Ability} it's been configured with.
     */
    dismiss(): Promise<void> {
        return this.findAbilitiesOfType<Discardable>('discard')
            .reduce(
                (previous: Promise<void>, ability: (Discardable & Ability)) =>
                    previous.then(() => ability.discard()),
                Promise.resolve(void 0),
            ) as Promise<void>;
    }

    /**
     * Returns a human-readable, string representation of this actor and their abilities.
     *
     * **PRO TIP:** To get the name of the actor, use {@apilink Actor.name}
     */
    toString(): string {
        const abilities = Array.from(this.abilities.values()).map(ability => ability.constructor.name);

        return `Actor(name=${ this.name }, abilities=[${ abilities.join(', ') }])`;
    }

    private initialiseAbilities(): Promise<void> {
        return this.findAbilitiesOfType<Initialisable>('initialise', 'isInitialised')
            .filter(ability => !ability.isInitialised())
            .reduce(
                (previous: Promise<void>, ability: (Initialisable & Ability)) =>
                    previous
                        .then(() => ability.initialise())
                        .catch(error => {
                            throw new TestCompromisedError(`${ this.name } couldn't initialise the ability to ${ ability.constructor.name }`, error);
                        }),
                Promise.resolve(void 0),
            )
    }

    private findAbilitiesOfType<T>(...methodNames: Array<keyof T>): Array<Ability & T> {
        const abilitiesFrom = (map: Map<AbilityType<Ability>, Ability>): Ability[] =>
            Array.from(map.values());

        const abilitiesWithDesiredMethods = (ability: Ability & T): boolean =>
            methodNames.every(methodName => typeof (ability[methodName]) === 'function');

        return abilitiesFrom(this.abilities)
            .filter(abilitiesWithDesiredMethods) as Array<Ability & T>;
    }

    private findAbilityTo<T extends Ability>(doSomething: AbilityType<T>): T | undefined {
        const abilityType = this.mostGenericTypeOf(doSomething);

        return this.abilities.get(abilityType) as T;
    }

    private acquireAbility(ability: Ability): void {
        if (!(ability instanceof Ability)) {
            throw new ConfigurationError(`Custom abilities must extend Ability from '@serenity-js/core'. Received ${ typeOf(ability) }`);
        }

        const abilityType = this.mostGenericTypeOf(ability.constructor as AbilityType<Ability>);

        this.abilities.set(abilityType, ability);
    }

    private mostGenericTypeOf<Generic_Ability extends Ability, Specific_Ability extends Generic_Ability>(
        abilityType: AbilityType<Specific_Ability>
    ): AbilityType<Generic_Ability> {
        const parentType = Object.getPrototypeOf(abilityType);
        return !parentType || parentType === Ability
            ? abilityType
            : this.mostGenericTypeOf(parentType)
    }

    /**
     * Instantiates a {@apilink Name} based on the string value of the parameter,
     * or returns the argument if it's already an instance of {@apilink Name}.
     *
     * @param maybeName
     */
    private nameFrom(maybeName: string | Name): Name {
        return typeof maybeName === 'string'
            ? new Name(maybeName)
            : maybeName;
    }
}
