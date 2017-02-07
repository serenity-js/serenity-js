import { Actor, PerformsTasks, UsesAbilities } from './actor';

export interface Task extends Performable {
    performAs(actor: PerformsTasks): PromiseLike<void>;
}

export interface FunctionalPerformable {
    <T extends Actor>(actor: T, ...args: any[]): PromiseLike<void>;
}

export interface Interaction extends Performable {
    performAs(actor: UsesAbilities): PromiseLike<void>;
}

export interface Performable {
    performAs<T extends Actor>(actor: T): PromiseLike<void>;
}

export type Attemptable = Performable | FunctionalPerformable;

export function isPerformable(attemptable: Attemptable): attemptable is Performable {
    return (<Performable> attemptable).performAs !== undefined;
}
