import {PerformsTasks} from "../performs_tasks";

export interface Ability {
    as<T extends Ability>(actor: PerformsTasks) : T
}