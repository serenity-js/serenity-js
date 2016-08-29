import {Ability} from './ability';
import {Performable} from './performables';
import { Question } from './question';

export interface PerformsTasks {
    attemptsTo(...tasks: Performable[]): Promise<void>;
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
    abilityTo<T extends Ability>(doSomething: {new (T): T }): T;
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
            this.abilities[ability.constructor.name] = ability.usedBy(this);
        });

        return this;
    }

    abilityTo<T extends Ability>(doSomething: {new (T): T }): T {
        if (! this.can(doSomething)) {
            throw new Error(`I don't have the ability to ${this.nameOf(doSomething)}, said ${this} sadly.`);
        }

        return <T> this.abilities[this.nameOf(doSomething)];
    }

    attemptsTo(...tasks: Performable[]): Promise<void> {
        return tasks.reduce((previous: Promise<void>, current: Performable, index, list) => {
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

    private can<T extends Ability> (doSomething: {new (T): T }): boolean {
        return !! this.abilities[this.nameOf(doSomething)];
    }

    private nameOf<T extends Ability>(ability: {new (T): T }): string {
        return ability.name;
    }
}
