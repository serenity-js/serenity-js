import { ArtifactGenerated } from '../../events';
import { Ability, AbilityType, KnowableUnknown, TestCompromisedError } from '../../index';
import { Artifact, Name } from '../../model';
import { Stage } from '../../stage';
import { TrackedActivity } from '../activities';
import { Activity } from '../Activity';
import { Question } from '../Question';
import { AnswersQuestions } from './AnswersQuestions';
import { CollectsArtifacts } from './CollectsArtifacts';
import { PerformsTasks } from './PerformsTasks';
import { UsesAbilities } from './UsesAbilities';

export class Actor implements PerformsTasks, UsesAbilities, AnswersQuestions, CollectsArtifacts {
    // todo: Actor should have execution strategies
    // todo: the default one executes every activity
    // todo: there could be a dry-run mode that default to skip strategy

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
        // todo: if there are no activities, make it a PendingActivity
        // todo: only change the execution strategy for the duration of the current task; tasks from afterhooks should still get executed
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

        function isDefined<V>(v: KnowableUnknown<V>) {
            return ! (knowableUnknown === undefined || knowableUnknown === null);
        }

        if (isDefined(knowableUnknown) && isAPromise(knowableUnknown)) {
            return knowableUnknown;
        }

        if (isDefined(knowableUnknown) && isAQuestion(knowableUnknown)) {
            return this.answer(knowableUnknown.answeredBy(this));
        }

        return Promise.resolve(knowableUnknown as T);
    }

    collect(artifact: Artifact, name?: Name) {
        this.stage.announce(new ArtifactGenerated(
            name || new Name(artifact.constructor.name),
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
}
