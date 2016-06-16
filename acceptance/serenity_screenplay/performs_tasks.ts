import {Performable} from "./performable";

export interface PerformsTasks {
    // attemptsTo(...tasks: Performable[]): Promise<void>
    attemptsTo(tasks: Performable[]): Promise<void>
}