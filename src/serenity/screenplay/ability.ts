import {PerformsTasks} from './actor';

export interface Ability {
    as<T extends Ability>(actor: PerformsTasks): T;
}
