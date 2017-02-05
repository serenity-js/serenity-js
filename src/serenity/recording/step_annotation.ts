import { Activity, ActivityFinished, ActivityStarts, Outcome, Result } from '../domain';
import { Attemptable, Performable } from '../screenplay';
import { StageManager } from '../stage';

export class StepNotifier {
    constructor(private stageManager: StageManager) {
    }

    executeStep(activity: Activity, step) {
        return Promise.resolve()
            .then(() => this.beforeStep(activity))
            .then(() => step())
            .then(() => this.afterStep(activity), e => this.onFailure(activity, e));
    }

    private beforeStep(activity: Activity) {
        this.stageManager.notifyOf(new ActivityStarts(activity));
    }

    private afterStep(activity: Activity) {
        this.stageManager.notifyOf(new ActivityFinished(new Outcome(activity, Result.SUCCESS)));
    }

    private onFailure(activity: Activity, error: Error) {
        this.stageManager.notifyOf(new ActivityFinished(new Outcome(activity, this.resultFrom(error), error)));

        return Promise.reject(error);
    }

    private resultFrom(error: Error): Result {
        const constructorOf = e => e && e.constructor ? e.constructor.name : '';

        // todo: sniff the exception to find out about the Result. Did the test fail, or was it compromised?
        return /AssertionError/.test(constructorOf(error))
            ? Result.FAILURE
            : Result.ERROR;
    }
}

// todo: add Significance to the @step
export function step<T extends Performable>(stepDescriptionTemplate: string): StepAnnotation<T> {
    return (target: T, propertyKey: string, descriptor: PerformAsMethodSignature) => {
        addDescription(target, stepDescriptionTemplate);
        return descriptor;
    };
}

export const StepAnnotationSymbol = Symbol('StepAnnotation');

export function addDescription<T extends Attemptable>(target: T, template: string): T {
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
