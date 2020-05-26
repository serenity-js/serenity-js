import { ActivityRelatedArtifactGenerated, AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed, DomainEvent, SceneFinishes } from '../../events';
import { Ability, AbilityType, Answerable, Cast, ConfigurationError, Discardable, serenity } from '../../index';
import { Artifact, CorrelationId, Description, Name } from '../../model';
import { ListensToDomainEvents } from '../../screenplay';
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
    CollectsArtifacts,
    ListensToDomainEvents
{
    // todo: Actor should have execution strategies
    // todo: the default one executes every activity
    // todo: there could be a dry-run mode that default to skip strategy

    /**
     * @deprecated
     * @param name
     */
    static named(name: string): CanHaveAbilities<Actor> {
        return {
            whoCan: (...abilities): Actor => {
                serenity.configure({
                    actors: Cast.whereEveryoneCan(...abilities),
                });

                return serenity.theActorCalled(name);
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
            throw new ConfigurationError(`${ this.name } can't ${ doSomething.name } yet. ` +
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
        abilities.forEach(ability => {
            const abilityType = ability.constructor as AbilityType<Ability>;
            if (this.abilities.has(abilityType)) {
                throw new ConfigurationError(`${ this.name } already has an ability to ${ abilityType.name }, so you don't need to give it to them again.`);
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

    notifyOf(event: DomainEvent): void {
        if (event instanceof SceneFinishes) {
            const id = CorrelationId.create();

            this.stage.announce(new AsyncOperationAttempted(
                new Description(`[${ this.constructor.name }] ${ this.name } discards abilities...`),
                id,
            ));

            this.discardAbilities()
                .then(() =>
                    this.stage.announce(new AsyncOperationCompleted(
                        new Description(`[${ this.constructor.name }] ${ this.name } discarded abilities successfully`),
                        id,
                )))
                .catch(error =>
                    this.stage.announce(new AsyncOperationFailed(error, id)),
                );
        }
    }

    /**
     * @desc
     *  Announce collection of an {@link Artifact} so that it can be picked up by a {@link StageCrewMember}.
     *
     * @param {Artifact} artifact
     * @param {?(string | Name)} name
     */
    collect(artifact: Artifact, name?: string | Name) {
        this.stage.announce(new ActivityRelatedArtifactGenerated(
            this.stage.currentActivityDetails(),
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

    /**
     * @desc
     *  Instantiates a {@link Name} based on the string value of the parameter,
     *  or returns the argument if it's already an instance of {@link Name}.
     *
     * @param {string | Name} maybeName
     * @returns {Name}
     */
    private nameFrom(maybeName: string | Name): Name {
        return typeof maybeName === 'string'
            ? new Name(maybeName)
            : maybeName;
    }

    private discardAbilities(): Promise<void> {
        const abilitiesFrom = (map: Map<AbilityType<Ability>, Ability>): Ability[] =>
            Array.from(map.values());

        const discardable = (ability: Ability): boolean =>
            'discard' in ability;

        return abilitiesFrom(this.abilities)
            .filter(discardable)
            .reduce((previous: Promise<void>, ability: (Discardable & Ability)) =>
                    previous.then(() => Promise.resolve(ability.discard())),
                Promise.resolve(void 0),
            ) as Promise<void>;
    }
}
