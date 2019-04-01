import { AnswersQuestions, PerformsActivities, UsesAbilities } from './actor';

export interface Activity {
    performAs(actor: PerformsActivities | UsesAbilities | AnswersQuestions): PromiseLike<any>;
    toString(): string;
}
