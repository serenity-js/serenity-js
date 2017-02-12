import { Activity } from './activities';
import { Question } from './question';

export interface Ability {} // tslint:disable-line:no-empty-interface
export interface AbilityConstructor<A extends Ability> {
    new (...args): A;
    as(actor: UsesAbilities): A;
}

export interface PerformsTasks {
    attemptsTo(...tasks: Activity[]): Promise<void>;
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
    abilityTo<T extends Ability>(doSomething: AbilityConstructor<T>): T;
}

export interface AnswersQuestions {
    toSee<T>(question: Question<T>): T;
}

export class Actor implements PerformsTasks, UsesAbilities, AnswersQuestions {

    private abilities: { [id: string]: Ability } = {};

    static named(name: string): Actor {
        return new Actor(name);
    }

    whoCan(...abilities: Ability[]): Actor {
        abilities.forEach(ability => {
            this.abilities[ability.constructor.name] = ability;
        });

        return this;
    }

    abilityTo<T extends Ability>(doSomething: AbilityConstructor<T>): T {
        if (! this.can(doSomething)) {
            throw new Error(`I don't have the ability to ${doSomething.name}, said ${this} sadly.`);
        }

        return this.abilities[doSomething.name] as T;
    }

    attemptsTo(...tasks: Activity[]): Promise<void> {
        return tasks.reduce((previous: Promise<void>, current: Activity) => {
            return previous.then(() => current.performAs(this));
        }, Promise.resolve(null));
    }

    toSee<T>(question: Question<T>): PromiseLike<T>|T {
        return question.answeredBy(this);
    }

    toString(): string {
        return this.name;
    }

    constructor(private name: string) { }

    private can<T extends Ability>(doSomething: AbilityConstructor<T>): boolean {
        return !! this.abilities[doSomething.name];
    }
}
