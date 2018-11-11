import { ArtifactGenerated, DomainEvent } from '../../events';
import { Ability, AbilityType, KnowableUnknown, LogicError, serenity, TestCompromisedError } from '../../index';
import { Artifact, Name, Timestamp } from '../../model';
import { Clock, StageManager } from '../../stage';
import { TrackedActivity } from '../activities';
import { Activity } from '../Activity';
import { Question } from '../Question';
import { AnswersQuestions } from './AnswersQuestions';
import { CollectsArtifacts } from './CollectsArtifacts';
import { PerformsTasks } from './PerformsTasks';
import { UsesAbilities } from './UsesAbilities';

export class Actor implements PerformsTasks, UsesAbilities, AnswersQuestions, CollectsArtifacts {
    private readonly abilities = new Map<AbilityType<Ability>, Ability>();

    static named(name: string): Actor {
        return new Actor(name, serenity.stageManager, new Clock());
    }

    // todo: Actor should have execution strategies
    // todo: the default one executes every activity
    // todo: there could be a dry-run mode that default to skip strategy

    constructor(
        public readonly name: string,
        private stageManager: StageManager,        // todo: this may need to be set by the stage
        private clock: Clock,                      // todo: this may need to be set by the stage
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
        // todo: if there are no activities, make it a PendingActivity
        // todo: only change the execution strategy for the duration of the current task; tasks from afterhooks should still get executed
        return activities
            .map(activity => new TrackedActivity(activity, this.stageManager, this.clock))
            .reduce((previous: Promise<void>, current: Activity) => {
                return previous.then(() => {
                    /* todo: add an execution strategy */
                    return current.performAs(this);
                });
        }, Promise.resolve(void 0));
    }

    whoCan(...abilities: Ability[]): Actor {
        abilities.forEach(ability => {
            this.abilities.set(ability.constructor as AbilityType<Ability>, ability);
        });

        return this;
    }

    /**
     * @param {KnowableUnknown<T>} knowableUnknown - a Question<Promise<T>>, Question<T>, Promise<T> or T
     * @returns {Promise<T>} The answer to the KnowableUnknown
     */
    answer<T>(knowableUnknown: KnowableUnknown<T>): Promise<T> {
        function isAPromise<V>(v: KnowableUnknown<V>): v is Promise<V> {
            return !!(v as any).then;
        }

        function isAQuestion<V>(v: KnowableUnknown<V>): v is Question<V> {
            return !! (v as any).answeredBy;
        }

        if (knowableUnknown === undefined || knowableUnknown === null) {
            return Promise.reject(new LogicError(`Can't answer a question that's not been defined.`));
        }

        if (isAPromise(knowableUnknown)) {
            return knowableUnknown;
        }

        if (isAQuestion(knowableUnknown)) {
            return this.answer(knowableUnknown.answeredBy(this));
        }

        return Promise.resolve(knowableUnknown as T);
    }

    collect(artifact: Artifact, name?: Name) {
        this.stageManager.notifyOf(new ArtifactGenerated(
            name || new Name(artifact.constructor.name),
            artifact,
            this.clock.now(),
        ));
    }

    toString() {
        const abilities = Array.from(this.abilities.keys()).map(type => type.name);

        return `Actor(name=${ this.name }, abilities=[${ abilities.join(', ') }])`;
    }

    private can<T extends Ability>(doSomething: AbilityType<T>): boolean {
        return this.abilities.has(doSomething);
    }
}
