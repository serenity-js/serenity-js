import { AnswersQuestions, PerformsTasks, UsesAbilities } from './actor';

export interface Activity {
    performAs(actor: PerformsTasks | UsesAbilities | AnswersQuestions): PromiseLike<any>;
    toString(): string;
}
