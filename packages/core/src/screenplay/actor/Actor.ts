import { TestCompromisedError } from '../../errors';
import { serenity } from '../../index';
import { Clock, StageManager } from '../../stage';
import { Ability, AbilityType } from '../Ability';
import { TrackedActivity } from '../activities';
import { Activity } from '../Activity';
import { Question } from '../Question';
import { AnswersQuestions } from './AnswersQuestions';
import { PerformsTasks } from './PerformsTasks';
import { UsesAbilities } from './UsesAbilities';

export class Actor implements PerformsTasks, UsesAbilities, AnswersQuestions {
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
            throw new TestCompromisedError(`${ this } can't ${ doSomething.name } yet. ` +
                `Did you give them the ability to do so?`);
        }

        return this.abilities.get(doSomething) as T;
    }

    attemptsTo(...activities: Activity[]): Promise<void> {
        // todo: if there are no activities, make it a PendingActivity
        return activities
            .map(activity => new TrackedActivity(activity, this.stageManager, this.clock))
            .reduce((previous: Promise<void>, current: Activity) => {
                return previous.then(() =>
                    /* todo: add an execution strategy */
                    current.performAs(this),
                );
        }, Promise.resolve(null));
    }

    toSee<T>(question: Question<T>): T {
        return question.answeredBy(this);
    }

    whoCan(...abilities: Ability[]): Actor {
        abilities.forEach(ability => {
            this.abilities.set(ability.constructor as AbilityType<Ability>, ability);
        });

        return this;
    }

    toString() {
        return this.name;
    }

    private can<T extends Ability>(doSomething: AbilityType<T>): boolean {
        return this.abilities.has(doSomething);
    }
}
