import { KnowableUnknown } from '../KnowableUnknown';

export interface AnswersQuestions {
    answer<T>(knownUnknown: KnowableUnknown<T>): Promise<T>;
}
