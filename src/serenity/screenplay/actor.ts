import {Ability} from './ability';
import {Performable} from './performables';

export interface PerformsTasks {
    attemptsTo(...tasks: Performable[]);
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

export class Actor implements PerformsTasks, UsesAbilities {

    private abilities: { [id: string]: Ability } = {};

    public static named(name: string): Actor {
        return new Actor(name);
    }

    public whoCan(...abilities: Ability[]): Actor {
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

    public attemptsTo(...tasks: Performable[]) {
        tasks.forEach((task) => task.performAs(this));
    }

    public toString(): string {
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
