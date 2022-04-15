import { Actor, Cast, Notepad, TakeNotes } from '../../../src';
import { ExampleNotes } from './ExampleNotes';

export class Actors implements Cast {

    private readonly sharedNotepad = Notepad.empty<ExampleNotes>();

    prepare(actor: Actor): Actor {
        switch (true) {
            case actor.name.endsWith('with shared notepad'):
                return actor.whoCan(TakeNotes.using(this.sharedNotepad));
            default:
                return actor.whoCan(TakeNotes.using(Notepad.empty<ExampleNotes>()));
        }
    }
}
