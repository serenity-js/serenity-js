import {Performable} from "./performables";

export interface PerformsTasks {
    attemptsTo(...tasks: Performable[])
}

export class Actor implements PerformsTasks {
    
    public static named(name: string) : Actor {
        return new Actor(name);
    }

    public attemptsTo(...tasks: Performable[]) {
        tasks.forEach((task) => task.performAs(this));
    }

    public toString() : string {
        return this.name;
    }

    constructor(name: string) {
        this.name = name;
    }
    
    private name:string;
}
