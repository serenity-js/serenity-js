import { Question } from '../Question';
import { AnswerableParameters } from './AnswerableParameters';
import { PromisedResult } from './PromisedResult';
import { SubtractKeys } from './SubtractKeys';

/* eslint-disable @typescript-eslint/indent */
export type ProxyQuestion<OriginalType> = {
    [Field in keyof SubtractKeys<OriginalType, Question<OriginalType>>]:
    // is it a method?
    OriginalType[Field] extends (...args: infer OriginalParameters) => infer OriginalMethodResult
        // make the method asynchronous
        ? (...args: AnswerableParameters<OriginalParameters>) => Question<Promise<PromisedResult<OriginalMethodResult>>> & ProxyQuestion<OriginalMethodResult>
        // is it an object?
        : Question<Promise<PromisedResult<OriginalType[Field]>>> & ProxyQuestion<OriginalType[Field]>
}
/* eslint-enable @typescript-eslint/indent */
