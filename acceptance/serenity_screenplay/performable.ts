import {PerformsTasks} from "./performs_tasks";

export interface Performable {
    performAs(actor: PerformsTasks)
}