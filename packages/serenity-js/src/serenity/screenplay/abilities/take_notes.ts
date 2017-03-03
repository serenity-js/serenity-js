import { Ability, UsesAbilities } from '../actor';

export interface Notepad {
    [x: string]: PromiseLike<any>;
}

export class TakeNotes implements Ability {

    static usingAnEmptyNotepad = () => TakeNotes.using({});
    static using = (notepad: Notepad) => new TakeNotes(notepad);

    static as(actor: UsesAbilities): TakeNotes {
        return actor.abilityTo(TakeNotes);
    }

    note = (topic: string, contents: PromiseLike<any> | any) => (this.notepad[topic] = contents, Promise.resolve());

    read(topic: string): PromiseLike<any> {
        return !! this.notepad[topic]
            ? Promise.resolve(this.notepad[topic])
            : Promise.reject(new Error(`I don\'t have any notes on the topic of "${ topic }"`));
    }

    constructor(private notepad: Notepad) {
    }
}
