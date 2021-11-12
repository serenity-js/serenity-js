import { Interaction } from '../Interaction';
import { Question } from '../Question';
import { AnswerableParameters } from './AnswerableParameters';
import { Awaited } from './Awaited';
import { SubtractKeys } from './SubtractKeys';

/* eslint-disable @typescript-eslint/indent */
export type Prop<OriginalType> = {
    [Field in keyof SubtractKeys<OriginalType, Question<OriginalType>>]:
    // is it a method?
    OriginalType[Field] extends (...args: infer OriginalParameters) => infer OriginalMethodResult
        // make the method asynchronous
        ? (...args: AnswerableParameters<OriginalParameters>) =>
            Question<Promise<Awaited<OriginalMethodResult>>> & Interaction & Prop<OriginalMethodResult>
        // is it an object?
        : Question<Promise<Awaited<OriginalType[Field]>>> & Interaction & Prop<OriginalType[Field]>
}
/* eslint-enable @typescript-eslint/indent */
