import { Activity, ActivityFinished, ActivityStarts, Outcome, Result } from '../domain';
import { Attemptable, Performable } from '../screenplay';
import { Actor } from '../screenplay/actor';
import { isPerformable } from '../screenplay/performables';
import { StageManager } from '../stage';
import { StepDescription } from './step_description';

export class StepExecutor {

    private notifier: StepNotifier;

    constructor(private actor: Actor, private stageManager: StageManager) {
        this.notifier = new StepNotifier(stageManager);
    }

    execute(attemptable: Attemptable): PromiseLike<void> {
        if (isDescribed(attemptable)) {
            return this.executeDescribed(attemptable);
        }
        return this.bindAttemptable(attemptable)();
    }

    private executeDescribed(attemptable: Attemptable): PromiseLike<void> {
        const annotation = getDescription(attemptable);
        const description = new StepDescription(annotation);
        const activity = this.getActivity(attemptable, description);
        return this.notifier.executeStep(activity, this.bindAttemptable(attemptable));
    }

    private bindAttemptable(attemptable: Attemptable) {
        if (isPerformable(attemptable)) {
            return attemptable.performAs.bind(attemptable, this.actor);
        }
        return attemptable.bind(null, this.actor);
    }

    private getActivity(attemptable: Attemptable, description) {
        if (isPerformable(attemptable)) {
            return description.interpolateWith(attemptable, [this.actor]);
        }
        return description.interpolateWith(null, [this.actor]);
    }
}

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
