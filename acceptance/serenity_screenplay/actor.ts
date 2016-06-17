import {PerformsTasks} from "./performs_tasks";
import {Performable} from "./performable";

export class Actor implements PerformsTasks {
    
    public static named(name: string) : Actor {
        return new Actor(name);
    }

    public attemptsTo(...tasks: Performable[]) {
        tasks.forEach((task) => task.performAs(this));
    }

    constructor(name: string) {
        this.name = name;
    }
    
    private name:string;
}
