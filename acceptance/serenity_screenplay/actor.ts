import {PerformsTasks} from "./performs_tasks";
import {Performable} from "./performable";

export class Actor implements PerformsTasks {
    
    public attemptsTo(...tasks: Performable[]): Promise<void> {
        return tasks.reduce((previousTask: Promise<void>, currentTask: Performable, currentIndex: number, array: Performable[]): Promise<void> => {
            return previousTask.then(() => currentTask.performAs(this));
        }, Promise.resolve());
    }
}