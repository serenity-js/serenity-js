import { getDescription, isDescribed, StepNotifier} from '../recording/step_annotation';
import { StepDescription } from '../recording/step_description';
import { Serenity } from '../serenity';
import { Attemptable, isPerformable } from './performables';
import { Question } from './question';

export interface Ability { }

export type CustomAbility<T extends Ability> = { new (...args): T };

export interface PerformsTasks {
    attemptsTo(...tasks: Attemptable[]): Promise<void>;
}

export interface UsesAbilities {
    /**
     * Gives the Actor the Abilities to perform Actions
     *
     * @param abilities
     */
    whoCan<T extends UsesAbilities>(...abilities: Ability[]): T;

    /**
     * Grants access to the Actor's ability
     *
     * @param doSomething   Ability class name
     */
    abilityTo<T extends Ability>(doSomething: CustomAbility<T>): T;
}

export interface AnswersQuestions {
    toSee<T>(question: Question<T>): T;
}

export class Actor implements PerformsTasks, UsesAbilities, AnswersQuestions {

    private abilities: { [id: string]: Ability } = {};

    private executor: Executor;

    static named(name: string): Actor {
        return new Actor(name);
    }

    whoCan(...abilities: Ability[]): Actor {
        abilities.forEach(ability => {
            this.abilities[ability.constructor.name] = ability;
        });

        return this;
    }

    abilityTo<T extends Ability>(doSomething: CustomAbility<T>): T {
        if (! this.can(doSomething)) {
            throw new Error(`I don't have the ability to ${this.nameOf(doSomething)}, said ${this} sadly.`);
        }

        return <T> this.abilities[this.nameOf(doSomething)];
    }

    attemptsTo(...tasks: Attemptable[]): Promise<void> {
        return tasks.reduce((previous: Promise<void>, current: Attemptable) => {
            return previous.then(() => this.executeAttemptable(current));
        }, Promise.resolve(null));
    }

    toSee<T>(question: Question<T>): PromiseLike<T>|T {
        return question.answeredBy(this);
    }

    toString(): string {
        return this.name;
    }

    whoNotifies(notifier: StepNotifier): Actor {
        this.executor = new Executor(this, notifier);

        return this;
    }

    // todo: get Executor/Notifier from DI container?
    constructor(private name: string, private notifier?: StepNotifier) {
        notifier = notifier || new StepNotifier(Serenity.stageManager());
        this.executor = new Executor(this, notifier);
    }

    private can<T extends Ability> (doSomething: CustomAbility<T>): boolean {
        return !! this.abilities[this.nameOf(doSomething)];
    }

    private nameOf<T extends Ability>(ability: CustomAbility<T>): string {
        return ability.name;
    }

    private executeAttemptable(attemptable: Attemptable): PromiseLike<void> {
        return this.executor.execute(attemptable);
    }
}

export class Executor {
    constructor(private actor: Actor, private notifier: StepNotifier) { }

    execute(attemptable: Attemptable): PromiseLike<void> {
        if (isDescribed(attemptable)) {
            return this.executeDescribed(attemptable);
        }
        return this.bindAttemptable(attemptable)();
    }

    private executeDescribed(attemptable: Attemptable): PromiseLike<void> {
        const annotation = getDescription(attemptable);
        const description = new StepDescription(annotation);
        const activity = this.getActivity(attemptable, description);
        return this.notifier.executeStep(activity, this.bindAttemptable(attemptable));
    }

    private bindAttemptable(attemptable: Attemptable) {
        if (isPerformable(attemptable)) {
            return attemptable.performAs.bind(attemptable, this.actor);
        }
        return attemptable.bind(null, this.actor);
    }

    private getActivity(attemptable: Attemptable, description) {
        if (isPerformable(attemptable)) {
            return description.interpolateWith(attemptable, [this.actor]);
        }
        return description.interpolateWith(null, [this.actor]);
    }
}
