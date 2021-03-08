import { ensure, isArray, isNumber } from 'tiny-types';
import { ListAdapter } from './ListAdapter';
import { Answerable } from '../../Answerable';
import { AnswersQuestions, UsesAbilities } from '../../actor';
import { formatted } from '../../../io';

export class ArrayListAdapter<Item_Type> implements ListAdapter<Promise<Item_Type>, Promise<Item_Type[]>> {
    constructor(private readonly array: Answerable<Item_Type[]>) {
    }

    count(actor: AnswersQuestions & UsesAbilities): Promise<number> {
        return this.arrayAs(actor)
            .then(items => items.length);
    }

    items(actor: AnswersQuestions & UsesAbilities): Promise<Item_Type[]> {
        return this.arrayAs(actor);
    }

    first(actor: AnswersQuestions & UsesAbilities): Promise<Item_Type> {
        return this.arrayAs(actor)
            .then(items => this.getItemAt(items, 0));
    }

    get(actor: AnswersQuestions & UsesAbilities, index: number): Promise<Item_Type> {
        return this.arrayAs(actor)
            .then(items => this.getItemAt(items, index));
    }

    last(actor: AnswersQuestions & UsesAbilities): Promise<Item_Type> {
        return this.arrayAs(actor)
            .then(items => this.getItemAt(items, items.length - 1));
    }

    toString() {
        return formatted`${ this.array }`
    }

    private arrayAs(actor: AnswersQuestions & UsesAbilities): Promise<Item_Type[]> {
        return actor.answer(this.array)
            .then(array => ensure('ArrayListAdapter constructor parameter', array, isArray()));
    }

    private getItemAt(items: Item_Type[], index: number): Item_Type {

        ensure('index', index, isNumber());

        const collectionDescription = this.toString();
        const itemsDescription = formatted`${ items }`;
        const description = collectionDescription !== itemsDescription
            ? `${ collectionDescription } ${ itemsDescription }`
            : itemsDescription;

        if (items.length === 0) {
            throw new Error(`${ description } is empty`);
        }

        if (index in items) {
            return items[index];
        }

        throw new Error(`${ description } has no item at index ${ index }`);
    }
}
