import { PerformsTasks, UsesAbilities } from './actor';

export interface Task extends Performable {
    performAs(actor: PerformsTasks): PromiseLike<void>;
}

export interface Interaction extends Performable {
    performAs(actor: UsesAbilities): PromiseLike<void>;
}

export interface Performable {
    performAs(actor: PerformsTasks | UsesAbilities): PromiseLike<void>;
}
