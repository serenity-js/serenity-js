import { PerformsTasks, UsesAbilities } from './actor';

export interface Task extends Performable {
    performAs(actor: PerformsTasks): Promise<void>;
}

export interface Action extends Performable {
    performAs(actor: PerformsTasks & UsesAbilities): Promise<void>;
}

export interface Performable {
    performAs(actor: PerformsTasks): Promise<void>;
}
