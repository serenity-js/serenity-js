import {PerformsTasks} from './actor';

export interface Task extends Performable {}

export interface Action extends Performable {}

export interface Performable {
    performAs(actor: PerformsTasks);
}
