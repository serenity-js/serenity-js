import { Expectation, ExpectationMet } from '@serenity-js/assertions';
import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { RelativeQuestion } from './RelativeQuestion';

export interface Collection<T> {
    filter(fn: (item: T, index?: number) => boolean | Promise<boolean>): Collection<T>;
    map<O>(fn: (item: T, index?: number) => O): PromiseLike<O[]>;
    first(): T;
    last(): T;
    get(index: number): T;
    count(): PromiseLike<number> | number;
}

/**
 * @experimental
 */
export class Pick<Item_Type, Collection_Type extends Collection<Item_Type> = Collection<Item_Type>> {

    static from<IT, CT extends Collection<IT> = Collection<IT>>(collection: Question<CT> | CT) {
        return new Pick<IT, CT>(collection);
    }

    constructor(
        private readonly collection: Question<Collection_Type> | Collection_Type,
        private readonly filters: Filters<Item_Type, Collection_Type> = new Filters<Item_Type, Collection_Type>(),
    ) {
    }

    count(): Question<Promise<number>> {
        return new NumberOfMatchingItems(this.collection, this.filters);
    }

    all(): Question<Collection_Type> {
        return new AllMatchingItems(this.collection, this.filters);
    }

    first(): Question<Item_Type> {
        return new FirstMatchingItem(this.collection, this.filters);
    }

    last(): Question<Item_Type> {
        return new LastMatchingItem(this.collection, this.filters);
    }

    get(index: number): Question<Item_Type> {
        return new NthMatchingItem(this.collection, this.filters, index);
    }

    where<Property_Type>(
        question: RelativeQuestion<Item_Type, Promise<Property_Type> | Property_Type>,
        expectation: Expectation<any, Promise<Property_Type> | Property_Type>,
    ): Pick<Item_Type, Collection_Type> {
        return new Pick<Item_Type, Collection_Type>(
            this.collection,
            this.filters.append(new Filter<Item_Type, Collection_Type, any>(question, expectation)),
        );
    }
}

/**
 * @package
 */
class Filters<Item_Type, Collection_Type
    extends Collection<Item_Type>>
    implements Question<(ct: Collection_Type) => Collection_Type>
{
    constructor(private readonly filters: Array<Filter<Item_Type, Collection_Type, any>> = []) {
    }

    append(filter: Filter<Item_Type, Collection_Type, any>) {
        return new Filters(this.filters.concat(filter));
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): (ct: Collection_Type) => Collection_Type {
        return (collection: Collection_Type) =>
            this.filters.reduce((filteredCollection, filter) =>
                    filter.answeredBy(actor)(filteredCollection),
                collection,
            );
    }

    toString() {
        const fullDescription = this.filters
            .reduce((description, filter) => description.concat(filter.toString()), [ ])
            .join(' and ');

        return fullDescription.length > 0
            ? `where ${ fullDescription }`
            : '';
    }
}

/**
 * @package
 */
class Filter<Item_Type, Collection_Type extends Collection<Item_Type>, Property_Type>
    implements Question<(ct: Collection_Type) => Collection_Type>
{
    constructor(
        private readonly question: RelativeQuestion<Item_Type, Promise<Property_Type> | Property_Type>,
        private readonly expectation: Expectation<any, Promise<Property_Type> | Property_Type>,
    ) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): (ct: Collection_Type) => Collection_Type {
        return (collection: Collection_Type) =>
            collection.filter((item: Item_Type) => {
                const expectation = this.expectation.answeredBy(actor);
                return Promise.resolve(this.question.of(item).answeredBy(actor))
                    .then(answer => expectation(answer))
                    .then(outcome => outcome instanceof ExpectationMet);
            }) as Collection_Type;
    }

    toString() {
        return formatted `${ this.question } does ${ this.expectation }`;
    }
}

/**
 * @package
 */
abstract class QuestionAboutCollectionItems<IT, CT extends Collection<IT>, Answer_Type>
    implements Question<Answer_Type>
{
    constructor(
        protected readonly collection: Question<CT> | CT,
        private readonly filters: Filters<IT, CT>,
        private readonly description: string,
    ) {
    }

    abstract answeredBy(actor: AnswersQuestions & UsesAbilities): Answer_Type;

    toString() {
        return `${ this.description } ${ formatted `${ this.collection }`} ${ this.filters.toString() }`.trim();
    }

    protected collectionFilteredBy(actor: AnswersQuestions & UsesAbilities): CT {
        const collection = this.isAQuestion(this.collection)
            ? this.collection.answeredBy(actor)
            : this.collection;

        return this.filters.answeredBy(actor)(collection);
    }

    private isAQuestion<T>(h: any): h is Question<T> {
        return !! (h as any).answeredBy;
    }
}

/**
 * @package
 */
class NumberOfMatchingItems<IT, CT extends Collection<IT>>
    extends QuestionAboutCollectionItems<IT, CT, Promise<number>>
{
    constructor(collection: Question<CT> | CT, filters: Filters<IT, CT>) {
        super(collection, filters, 'the number of');
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<number> {
        return Promise.resolve(this.collectionFilteredBy(actor).count());
    }
}

/**
 * @package
 */
class AllMatchingItems<IT, CT extends Collection<IT>> extends QuestionAboutCollectionItems<IT, CT, CT> {

    constructor(collection: Question<CT> | CT, filters: Filters<IT, CT>) {
        super(collection, filters, '');
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): CT {
        return this.collectionFilteredBy(actor);
    }
}

/**
 * @package
 */
class FirstMatchingItem<IT, CT extends Collection<IT>> extends QuestionAboutCollectionItems<IT, CT, IT> {

    constructor(collection: Question<CT> | CT, filters: Filters<IT, CT>) {
        super(collection, filters, 'the first of');
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): IT {
        return this.collectionFilteredBy(actor).first();
    }
}

/**
 * @package
 */
class LastMatchingItem<IT, CT extends Collection<IT>> extends QuestionAboutCollectionItems<IT, CT, IT> {

    constructor(collection: Question<CT> | CT, filters: Filters<IT, CT>) {
        super(collection, filters, 'the last of');
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): IT {
        return this.collectionFilteredBy(actor).last();
    }
}

/**
 * @package
 */
class NthMatchingItem<IT, CT extends Collection<IT>> extends QuestionAboutCollectionItems<IT, CT, IT> {
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

    constructor(
        collection: Question<CT> | CT,
        filters: Filters<IT, CT>,
        private readonly index: number,
    ) {
        super(collection, filters, `the ${ NthMatchingItem.ordinalSuffixOf(index + 1) } of`);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): IT {
        return this.collectionFilteredBy(actor).get(this.index);
    }
}
