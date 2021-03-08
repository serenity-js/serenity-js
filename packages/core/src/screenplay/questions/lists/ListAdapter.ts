import { AnswersQuestions, UsesAbilities } from '../../actor';

export interface ListAdapter<Item_Return_Type, Collection_Return_Type> {
    count(actor: AnswersQuestions & UsesAbilities): Promise<number>;

    first(actor: AnswersQuestions & UsesAbilities): Item_Return_Type;
    last(actor: AnswersQuestions & UsesAbilities): Item_Return_Type;
    get(actor: AnswersQuestions & UsesAbilities, index: number): Item_Return_Type;

    items(actor: AnswersQuestions & UsesAbilities): Collection_Return_Type;

    // forEach
    // map
    // filter
}
