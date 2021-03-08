import { ArrayListAdapter, ListAdapter } from './lists';
import { Answerable } from '../Answerable';
import { Question } from '../Question';

export class List<List_Adapter_Type extends ListAdapter<Item_Return_Type, Collection_Return_Type>, Item_Return_Type, Collection_Return_Type> {

    static of<Item_Type>(items: Answerable<Item_Type[]>) {
        return new List<ArrayListAdapter<Item_Type>, Promise<Item_Type>, Promise<Item_Type[]>>(new ArrayListAdapter(items))
    }

    constructor(
        private readonly collection: List_Adapter_Type,
        /* filters */
    ) {
    }

    items(): Question<Collection_Return_Type> {
        return Question.about(this.collection.toString(), actor => this.collection.items(actor));
    }

    count(): Question<Promise<number>> {
        return Question.about(`the item count of ${ this.collection.toString() }`, actor =>
            this.collection.count(actor)
        );
    }

    first(): Question<Item_Return_Type> {
        return Question.about(`the first of ${ this.collection.toString() }`, actor =>
            this.collection.first(actor)
        );
    }

    last(): Question<Item_Return_Type> {
        return Question.about(`the last of ${ this.collection.toString() }`, actor =>
            this.collection.last(actor)
        );
    }

    get(index: number): Question<Item_Return_Type> {
        return Question.about(`the ${ List.ordinalSuffixOf(index + 1) } of ${ this.collection.toString() }`, actor =>
            this.collection.get(actor, index)
        );
    }

    // todo: add filters

    private static ordinalSuffixOf(index: number) {
        const
            j = index % 10,
            k = index % 100;

        switch (true) {
            case (j === 1 && k !== 11):
                return index + 'st';
            case (j === 2 && k !== 12):
                return index + 'nd';
            case (j === 3 && k !== 13):
                return index + 'rd';
            default:
                return index + 'th';
        }
    }
}
