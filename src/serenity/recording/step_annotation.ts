import { Activity, ActivityFinished, ActivityStarts, Outcome, Result } from '../domain';
import { Performable } from '../screenplay';
import { Serenity } from '../serenity';
import { StageManager } from '../stage';
import { StepDescription } from './step_description';

import * as _ from 'lodash';

// todo: add Significance to the @step
export class Step {
    static isDecorated = Symbol('isStepDecorated');

    constructor(private notifier: StepNotifier) {
    }

    describedUsing<T extends Performable>(template: string): StepAnnotation<T> {

        const notifier = this.notifier;
        const description = new StepDescription(template);

        return (target: T, propertyKey: string, descriptor: PerformAsMethodSignature) => {

            const performAs = descriptor.value,
                  decorator = _.cloneDeep(descriptor);

            target[Step.isDecorated] = true;

            decorator.value = function(...args: any[]): PromiseLike<void> {

                const activity: Activity = description.interpolateWith(this, args);

                return notifier.executeStep(activity, performAs.bind(this, ...args));
            };

            return decorator;
        };
    }
}

export class StepNotifier {
    constructor(private stageManager: StageManager) {
    }

    executeStep<T extends Performable>(activity: Activity, step) {
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

export function step<T extends Performable>(stepDescriptionTemplate: string): StepAnnotation<T> {
    return new Step(new StepNotifier(Serenity.stageManager())).describedUsing(stepDescriptionTemplate);
}

export type PerformAsMethodSignature = TypedPropertyDescriptor<(PerformsTasks) => PromiseLike<void>>;

export interface StepAnnotation<T extends Performable> {
    (target: T, propertyKey: string, descriptor: PerformAsMethodSignature): PerformAsMethodSignature;
}
