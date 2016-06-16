import {PerformsTasks} from "./performs_tasks";
import {Performable} from "./performable";

export class Actor implements PerformsTasks {

    // todo: doesn't work with '...'.
    public attemptsTo(...tasks: Performable[]): Promise<void> {
        return tasks.reduce((previousTask: Promise<void>, currentTask: Performable, currentIndex: number, array: Performable[]): Promise<void> => {
            return previousTask.then(() => currentTask.performAs(this));
        }, Promise.resolve());
        
        // return Promise.resolve();
    }

    // public attemptsTo(...tasks: Array<Performable>):Promise<void> {
    //     return undefined;
    // }

// attemptsTo(...tasks : Performable[]) : Promise<void> {
    //     return undefined;


//         // todos.forEach(todo => {
//         //     todo.performAs(this);
//         // });
//
//         // todos.reduce((previousValue: Promise<{}>, todo: Performable, currentIndex: number, array: Performable[]): Promise<{}> => {
//         //     return previousValue.then(todo.performAs(this));
//         // }, Promise.resolve());
//
//         // tasks.reduce((previousTask: Promise<void>, currentTask: Performable, currentIndex: number, array: Performable[]): Promise<void> => {
//         //     return previousTask.then(() => currentTask.performAs(this));
//         // }, Promise.resolve());
//
//
//         // todos.reduce((previousValue: Performable, currentValue: Performable, currentIndex: number, array: Performable[]) => {
//         //     return undefined;
//         // }, Promise.resolve());
//
//         return Promise.resolve();
//     }
}