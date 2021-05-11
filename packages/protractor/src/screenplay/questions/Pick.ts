import { AnswersQuestions, Expectation, ExpectationMet, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

export interface Collection<T> {
    filter(fn: (item: T, index?: number) => boolean | Promise<boolean>): Collection<T>;
    map<O>(fn: (item: T, index?: number) => O): PromiseLike<O[]>;
    first(): T;
    last(): T;
    get(index: number): T;
    count(): PromiseLike<number> | number;
}

/**
 * @deprecated
 *  Please use [Target.all](/modules/protractor/class/src/screenplay/questions/targets/Target.ts~Target.html) instead.
 *
 * @experimental
 *
 * @see {@link @serenity-js/core/lib/screenplay/questions~List}
 */
export class Pick<Item_Type, Collection_Type extends Collection<Item_Type> = Collection<Item_Type>> {

    static from<IT, CT extends Collection<IT> = Collection<IT>>(collection: Question<CT> | CT): Pick<IT, CT> {
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
        question: MetaQuestion<Item_Type, Promise<Property_Type> | Property_Type>,
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
class Filters<Item_Type, Collection_Type extends Collection<Item_Type>>
    extends Question<(ct: Collection_Type) => Collection_Type>
{
    constructor(private readonly filters: Array<Filter<Item_Type, Collection_Type, any>> = []) {
        super('');

        const fullDescription = this.filters
            .reduce((description, filter) => description.concat(filter.toString()), [ ])
            .join(' and ');

        this.subject = fullDescription.length > 0
            ? `where ${ fullDescription }`
            : '';
    }

    append(filter: Filter<Item_Type, Collection_Type, any>) {
        return new Filters(this.filters.concat(filter));
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  answer this {@link @serenity-js/core/lib/screenplay~Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     */
    answeredBy(actor: AnswersQuestions & UsesAbilities): (ct: Collection_Type) => Collection_Type {
        return (collection: Collection_Type) =>
            this.filters.reduce(
                (filteredCollection, filter) =>
                    filter.answeredBy(actor)(filteredCollection),
                collection,
            );
    }
}

/**
 * @package
 */
class Filter<Item_Type, Collection_Type extends Collection<Item_Type>, Property_Type>
    extends Question<(ct: Collection_Type) => Collection_Type>
{
    constructor(
        private readonly question: MetaQuestion<Item_Type, Promise<Property_Type> | Property_Type>,
        private readonly expectation: Expectation<any, Promise<Property_Type> | Property_Type>,
    ) {
        super(formatted `${ question } does ${ expectation }`);
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  answer this {@link @serenity-js/core/lib/screenplay~Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     */
    answeredBy(actor: AnswersQuestions & UsesAbilities): (ct: Collection_Type) => Collection_Type {
        return (collection: Collection_Type) =>
            collection.filter((item: Item_Type) => {
                const expectation = this.expectation.answeredBy(actor);
                return Promise.resolve(this.question.of(item).answeredBy(actor))
                    .then(answer => expectation(answer))
                    .then(outcome => outcome instanceof ExpectationMet);
            }) as Collection_Type;
    }
}

/**
 * @package
 */
abstract class QuestionAboutCollectionItems<IT, CT extends Collection<IT>, Answer_Type>
    extends Question<Answer_Type>
{
    constructor(
        protected readonly collection: Question<CT> | CT,
        private readonly filters: Filters<IT, CT>,
        private readonly description: string,
    ) {
        super(`${ description } ${ formatted `${ collection }`} ${ filters.toString() }`.trim())
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  answer this {@link @serenity-js/core/lib/screenplay~Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     */
    abstract answeredBy(actor: AnswersQuestions & UsesAbilities): Answer_Type;

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

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  answer this {@link @serenity-js/core/lib/screenplay~Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     */
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

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  answer this {@link @serenity-js/core/lib/screenplay~Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     */
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

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  answer this {@link @serenity-js/core/lib/screenplay~Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     */
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

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  answer this {@link @serenity-js/core/lib/screenplay~Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     */
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
            lastDigit = index % 10,
            lastTwoDigits = index % 100;

        switch (true) {
            case (lastDigit === 1 && lastTwoDigits !== 11):
                return index + 'st';
            case (lastDigit === 2 && lastTwoDigits !== 12):
                return index + 'nd';
            case (lastDigit === 3 && lastTwoDigits !== 13):
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

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  answer this {@link @serenity-js/core/lib/screenplay~Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     */
    answeredBy(actor: AnswersQuestions & UsesAbilities): IT {
        return this.collectionFilteredBy(actor).get(this.index);
    }
}
