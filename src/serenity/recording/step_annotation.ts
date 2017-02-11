import { serenity } from '../../';
import { Activity, ActivityFinished, ActivityStarts, Outcome, Result } from '../domain';
import { Performable } from '../screenplay';
import { StageManager } from '../stage';
import { StepDescription } from './step_description';

import * as _ from 'lodash';

// todo: add Significance to the @step
export class Step {

    constructor(private stageManager: StageManager) {
    }

    describedUsing<T extends Performable>(template: string): StepAnnotation<T> {

        const
            description = new StepDescription(template),
            decorated   = this;

        return (target: T, propertyKey: string, descriptor: PerformAsMethodSignature) => {

            const
                performAs = descriptor.value,
                decorator = _.cloneDeep(descriptor);

            decorator.value = function(...args: any[]): PromiseLike<void> {

                const activity: Activity = description.interpolateWith(this, args);

                return Promise.resolve()
                    .then(() => decorated.beforeStep(activity))
                    .then(() => performAs.apply(this, args))
                    .then(() => decorated.afterStep(activity), e => decorated.onFailure(activity, e));
            };

            return decorator;
        };
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
    return new Step(serenity.stageManager()).describedUsing(stepDescriptionTemplate);
}

export type PerformAsMethodSignature = TypedPropertyDescriptor<(PerformsTasks) => PromiseLike<void>>;

export type StepAnnotation<T extends Performable> = (target: T, propertyKey: string, descriptor: PerformAsMethodSignature) => PerformAsMethodSignature;
