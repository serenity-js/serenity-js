import {Performable} from "./performable";

export interface PerformsTasks {
    attemptsTo(...tasks: Performable[])
}