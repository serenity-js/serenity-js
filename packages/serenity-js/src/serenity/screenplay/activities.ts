import { AnswersQuestions, PerformsTasks, UsesAbilities } from './actor';

export abstract class Task implements Activity {
    abstract performAs(actor: PerformsTasks): PromiseLike<void>;
}

export interface Interaction extends Activity {
    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void>;
}

export interface Activity {
    performAs(actor: PerformsTasks | UsesAbilities | AnswersQuestions): PromiseLike<void>;
}
