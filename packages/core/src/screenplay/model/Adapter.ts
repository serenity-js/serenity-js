import { Answerable } from '../Answerable';
import { Interaction } from '../Interaction';
import { Question } from '../Question';

export type Adapter<OriginalType> = {
    [Field in keyof Omit<OriginalType, keyof Question<OriginalType>>]:
    // is it a method?
    OriginalType[Field] extends (...args: infer OriginalParameters) => infer OriginalMethodResult
    // make the method signature asynchronous, accepting Answerables and returning a Promise
        ? (...args: { [P in keyof OriginalParameters]: Answerable<OriginalParameters[P]> }) =>  Question<Promise<Awaited<OriginalMethodResult>>> & Interaction & Adapter<Awaited<OriginalMethodResult>>
    // is it an object? wrap each field
        : Question<Promise<Awaited<OriginalType[Field]>>> & Interaction & Adapter<Awaited<OriginalType[Field]>>
}

