import { ArtifactGenerated } from '../events';
import { Ability, AbilityType, Answerable, DressingRoom, serenity, TestCompromisedError } from '../index';
import { Artifact, Name } from '../model';
import { Stage } from '../stage';
import { TrackedActivity } from './activities';
import { Activity } from './Activity';
import { Question } from './Question';

/**
 * @desc
 *  Enables the {@link Actor} to answer a {@link Question} about the system under test
 *
 * @public
 * @interface
 */
export abstract class AnswersQuestions {
    abstract answer<T>(knownUnknown: Answerable<T>): Promise<T>;
}

/**
 * @desc
 *  Enables the {@link Actor} to collect {@link Artifact}s while the scenario is being executed
 *
 * @public
 * @interface
 */
export abstract class CollectsArtifacts {
    /**
     * @desc
     * Makes the {@link Actor} collect an {@link Artifact} so that it's included in the test report.
     *
     * @param {Artifact} artifact - The artifact to be collected, such as {@link JSONData}
     * @param {Name} [name] - The name of the artifact to make it easy to recognise in the test report
     */
    abstract collect(artifact: Artifact, name?: Name): void;
}

/**
 * @desc
 *  Enables the {@link Actor} to perform an {@link Activity}, such as a {@link Task} or an {@link Interaction}
 *
 * @public
 * @interface
 */
export abstract class PerformsActivities {
    abstract attemptsTo(...tasks: Activity[]): Promise<void>;
}

/**
 * @desc
 *  Enables the {@link Actor} to have an {@link Ability} or Abilities to perform some {@link Activity}.
 *
 * @public
 * @interface
 */
export abstract class CanHaveAbilities<Returned_Type = UsesAbilities> {
    /**
     * @param {Ability[]} abilities
     * @returns {Actor}
     */
    abstract whoCan(...abilities: Ability[]): Returned_Type;
}

/**
 * @desc
 *  Enables the {@link Actor} to use an {@link Ability} to perform some {@link Activity}.
 *
 * @public
 * @interface
 */
export abstract class UsesAbilities {

    /**
     * @desc
     *  Grants access to the Actor's ability
     *
     * @param {AbilityType<T extends Ability>} doSomething
     * @returns {T}
     */
    abstract abilityTo<T extends Ability>(doSomething: AbilityType<T>): T;
}

export class Actor implements PerformsActivities, UsesAbilities, CanHaveAbilities<Actor>, AnswersQuestions, CollectsArtifacts {
    // todo: Actor should have execution strategies
    // todo: the default one executes every activity
    // todo: there could be a dry-run mode that default to skip strategy

    static named(name: string): CanHaveAbilities<Actor> {
        return {
            whoCan: (...abilities): Actor => {
                const stage = serenity.callToStageFor(DressingRoom.whereEveryoneCan(...abilities));

                return stage.theActorCalled(name);
            },
        };
    }

    constructor(
        public readonly name: string,
        private readonly stage: Stage,
        private readonly abilities: Map<AbilityType<Ability>, Ability> = new Map<AbilityType<Ability>, Ability>(),
    ) {
    }

    abilityTo<T extends Ability>(doSomething: AbilityType<T>): T {
        if (! this.can(doSomething)) {
            throw new TestCompromisedError(`${ this.name } can't ${ doSomething.name } yet. ` +
                `Did you give them the ability to do so?`);
        }

        return this.abilities.get(doSomething) as T;
    }

    attemptsTo(...activities: Activity[]): Promise<void> {
        return activities
            .map(activity => new TrackedActivity(activity, this.stage))  // todo: TrackedInteraction, TrackedTask
            .reduce((previous: Promise<void>, current: Activity) => {
                return previous.then(() => {
                    /* todo: add an execution strategy */
                    return current.performAs(this);
                });
            }, Promise.resolve(void 0));
    }

    whoCan(...abilities: Ability[]): Actor {
        const map = new Map<AbilityType<Ability>, Ability>(this.abilities);

        abilities.forEach(ability => {
            map.set(ability.constructor as AbilityType<Ability>, ability);
        });

        return new Actor(this.name, this.stage, map);
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

    collect(artifact: Artifact, name?: string | Name) {
        this.stage.announce(new ArtifactGenerated(
            this.nameFrom(name || new Name(artifact.constructor.name)),
            artifact,
            this.stage.currentTime(),
        ));
    }

    toString() {
        const abilities = Array.from(this.abilities.keys()).map(type => type.name);

        return `Actor(name=${ this.name }, abilities=[${ abilities.join(', ') }])`;
    }

    private can<T extends Ability>(doSomething: AbilityType<T>): boolean {
        return this.abilities.has(doSomething);
    }

    private nameFrom(maybeName: string | Name): Name {
        return typeof maybeName === 'string'
            ? new Name(maybeName)
            : maybeName;
    }
}
