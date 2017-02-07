import { Attemptable } from '../screenplay/performables';

export const StepAnnotationSymbol = Symbol('StepAnnotation');

export function describeStep<T extends Attemptable>(target: T, template: string): T {
    target[StepAnnotationSymbol] = template;
    return target;
}

export function getDescription<T extends Attemptable>(attemptable: T) {
    return attemptable[StepAnnotationSymbol];
}

// todo: make DescribedAttemptable a type when symbols will work with interfaces
// https://github.com/Microsoft/TypeScript/issues/5579
export function isDescribed<T extends Attemptable>(attemptable: T) {
    return !!getDescription(attemptable);
}
