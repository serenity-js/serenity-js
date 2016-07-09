import { PerformsTasks, UsesAbilities } from './actor';

export interface Task extends Performable {
    performAs(actor: PerformsTasks);
}

export interface Action extends Performable {
    performAs(actor: PerformsTasks & UsesAbilities);
}

export interface Performable {
    performAs(actor: PerformsTasks);
}
