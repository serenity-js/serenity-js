import { serenity } from '../../';
import { ActivityFinished, ActivityStarts, Outcome, RecordedActivity, Result } from '../domain';
import { Activity } from '../screenplay';
import { StageManager } from '../stage';
import { ActivityDescription } from './activity_description';
import { ActivityType } from './activity_type';

import * as _ from 'lodash';

// todo: refactor
export class Step {

    constructor(private stageManager: StageManager, private activityType: ActivityType = ActivityType.Task) {
    }

    describedUsing<T extends Activity>(template: string): StepAnnotation<T> {

        const
            description = new ActivityDescription(template, this.activityType),
            decorated   = this;

        return (target: T, propertyKey: string, descriptor: PerformAsMethodSignature) => {

            const
                performAs = descriptor.value,
                decorator = _.cloneDeep(descriptor);

            decorator.value = function(...args: any[]): PromiseLike<void> {

                const recordedActivity: RecordedActivity = description.interpolateWith(this, args);

                return Promise.resolve()
                    .then(() => decorated.beforeStep(recordedActivity))
                    .then(() => performAs.apply(this, args))
                    .then(() => decorated.afterStep(recordedActivity), e => decorated.onFailure(recordedActivity, e));
            };

            return decorator;
        };
    }

    private beforeStep(activity: RecordedActivity) {
        this.stageManager.notifyOf(new ActivityStarts(activity));
    }

    private afterStep(activity: RecordedActivity) {
        this.stageManager.notifyOf(new ActivityFinished(new Outcome(activity, Result.SUCCESS)));
    }

    private onFailure(activity: RecordedActivity, error: Error) {
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

export function step<A extends Activity>(stepDescriptionTemplate: string, type: ActivityType = ActivityType.Task): StepAnnotation<A> {
    return new Step(serenity.stageManager(), type).describedUsing(stepDescriptionTemplate);
}

export type PerformAsMethodSignature = TypedPropertyDescriptor<(PerformsTasks) => PromiseLike<void>>;

export type StepAnnotation<T extends Activity> = (target: T, propertyKey: string, descriptor: PerformAsMethodSignature) => PerformAsMethodSignature;
