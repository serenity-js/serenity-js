import { Attemptable, Performable } from '../screenplay/performables';

// todo: add Significance to the @step
export function step<T extends Performable>(stepDescriptionTemplate: string): StepAnnotation<T> {
    return (target: T, propertyKey: string, descriptor: PerformAsMethodSignature) => {
        describeStep(target, stepDescriptionTemplate);
        return descriptor;
    };
}

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

export type PerformAsMethodSignature = TypedPropertyDescriptor<(PerformsTasks) => PromiseLike<void>>;

export interface StepAnnotation<T extends Attemptable> {
    (target: T, propertyKey: string, descriptor: PerformAsMethodSignature): PerformAsMethodSignature;
}
