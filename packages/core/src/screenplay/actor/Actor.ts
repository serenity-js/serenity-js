import { ConfigurationError, TestCompromisedError } from '../../errors';
import { ActivityRelatedArtifactGenerated } from '../../events';
import { Artifact, Name } from '../../model';
import { Ability, AbilityType, Answerable, Discardable, Initialisable } from '../../screenplay';
import { Stage } from '../../stage';
import { TrackedActivity } from '../activities';
import { Activity } from '../Activity';
import { Question } from '../Question';
import { AnswersQuestions } from './AnswersQuestions';
import { CanHaveAbilities } from './CanHaveAbilities';
import { CollectsArtifacts } from './CollectsArtifacts';
import { PerformsActivities } from './PerformsActivities';
import { UsesAbilities } from './UsesAbilities';

export class Actor implements
    PerformsActivities,
    UsesAbilities,
    CanHaveAbilities<Actor>,
    AnswersQuestions,
    CollectsArtifacts
{
    // todo: Actor should have execution strategies
    // todo: the default one executes every activity
    // todo: there could be a dry-run mode that default to skip strategy

    constructor(
        public readonly name: string,
        private readonly stage: Stage,
        private readonly abilities: Map<AbilityType<Ability>, Ability> = new Map<AbilityType<Ability>, Ability>(),
    ) {
    }

    /**
     * @desc
     *  Retrieves actor's {@link Ability} to `doSomething`.
     *
     *  Please note that this method performs an [`instancepf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof)
     *  check against abilities given to this actor via {@link Actor#whoCan}. Please also note that {@link Actor#whoCan} performs
     *  the same check when abilities are assigned to the actor to ensure the actor has at most one instance of a given ability type.
     *
     * @param doSomething
     */
    abilityTo<T extends Ability>(doSomething: AbilityType<T>): T {
        const found = this.findAbilityTo(doSomething);

        if (! found) {
            throw new ConfigurationError(`${ this.name } can't ${ doSomething.name } yet. ` +
                `Did you give them the ability to do so?`);
        }

        return found;
    }

    /**
     * @desc
     *  Instructs the actor to attempt to perform a number of activities
     *  (see {@link Activity}, so either {@link Task}s or {@link Interaction}s)
     *  one by one.
     *
     * @param {...activities: Activity[]} activities
     * @return {Promise<void>}
     */
    attemptsTo(...activities: Activity[]): Promise<void> {
        return activities
            .map(activity => new TrackedActivity(activity, this.stage))
            .reduce((previous: Promise<void>, current: Activity) => {
                return previous.then(() => {
                    /* todo: add an execution strategy */
                    return current.performAs(this);
                });
            }, this.initialiseAbilities());
    }

    /**
     * @desc
     *  Gives this Actor a list of abilities (see {@link Ability}) they can use
     *  to interact with the system under test or the test environment.
     *
     * @param {...Ability[]} abilities
     *  A vararg list of abilities to give the actor
     *
     * @returns {Actor}
     *  The actor with newly gained abilities
     *
     * @throws {ConfigurationError}
     *  Throws a ConfigurationError if the actor already has an ability of this type.
     */
    whoCan(...abilities: Ability[]): Actor {
        abilities.forEach(ability => {
            const abilityType = ability.constructor as AbilityType<Ability>;

            const found = this.findAbilityTo(abilityType);

            if (found) {
                const description = found.constructor.name === abilityType.name
                    ? found.constructor.name
                    : `${ found.constructor.name } (which extends ${ abilityType.name })`

                throw new ConfigurationError(`${ this.name } already has an ability to ${ description }, so you don't need to give it to them again.`);
            }

            this.abilities.set(ability.constructor as AbilityType<Ability>, ability);
        });

        return this;
    }

    /**
     * @param {Answerable<T>} answerable - a Question<Promise<T>>, Question<T>, Promise<T> or T
     * @returns {Promise<T>} The answer to the Answerable
     */
    answer<T>(answerable: Answerable<T>): Promise<T> {
        function isAPromise<V>(v: Answerable<V>): v is Promise<V> {
            return !!(v as any).then;
        }

        function isDefined<V>(v: Answerable<V>) {
            return ! (answerable === undefined || answerable === null);
        }

        if (isDefined(answerable) && isAPromise(answerable)) {
            return answerable;
        }

        if (isDefined(answerable) && Question.isAQuestion(answerable)) {
            return this.answer(answerable.answeredBy(this));
        }

        return Promise.resolve(answerable as T);
    }

    /**
     * @desc
     *  Announce collection of an {@link Artifact} so that it can be picked up by a {@link StageCrewMember}.
     *
     * @param {Artifact} artifact
     * @param {?(string | Name)} name
     *
     * @returns {void}
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
     * @desc
     *  Instructs the actor to invoke {@link Discardable#discard} method on any
     *  {@link Discardable} {@link Ability} it's been configured with.
     *
     * @returns {Promise<void>}
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
     * @desc
     *  Returns a human-readable, string representation of this Actor
     *
     * @returns {string}
     */
    toString(): string {
        const abilities = Array.from(this.abilities.keys()).map(type => type.name);

        return `Actor(name=${ this.name }, abilities=[${ abilities.join(', ') }])`;
    }

    /**
     * @private
     */
    private initialiseAbilities(): Promise<void> {
        return this.findAbilitiesOfType<Initialisable>('initialise', 'isInitialised')
            .filter(ability => ! ability.isInitialised())
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

    /**
     * @param {...string[]} methodNames
     * @private
     */
    private findAbilitiesOfType<T>(...methodNames: Array<keyof T>): Array<Ability & T> {
        const abilitiesFrom = (map: Map<AbilityType<Ability>, Ability>): Ability[] =>
            Array.from(map.values());

        const abilitiesWithDesiredMethods = (ability: Ability & T): boolean =>
            methodNames.every(methodName => typeof(ability[methodName]) === 'function');

        return abilitiesFrom(this.abilities)
            .filter(abilitiesWithDesiredMethods) as Array<Ability & T>;
    }

    /**
     * @param {string} doSomething
     * @private
     */
    private findAbilityTo<T extends Ability>(doSomething: AbilityType<T>): T | undefined {
        for (const [abilityType_, ability] of this.abilities) {
            if (ability instanceof doSomething) {
                return ability as T;
            }
        }

        return undefined;
    }

    /**
     * @desc
     *  Instantiates a {@link Name} based on the string value of the parameter,
     *  or returns the argument if it's already an instance of {@link Name}.
     *
     * @param {string | Name} maybeName
     * @returns {Name}
     *
     * @private
     */
    private nameFrom(maybeName: string | Name): Name {
        return typeof maybeName === 'string'
            ? new Name(maybeName)
            : maybeName;
    }
}
