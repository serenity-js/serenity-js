import { Activity, ActivityFinished, ActivityStarts, Outcome, Result } from '../domain';
import { Performable } from '../screenplay';
import { Serenity } from '../serenity';
import { StageManager } from '../stage';
import { StepDescription } from './step_description';

import * as _ from 'lodash';

// todo: add Significance to the @step
export class Step {

    constructor(private stageManager: StageManager) {
    }

    describedUsing<T extends Performable>(template: string): StepAnnotation<T> {

        let description = new StepDescription(template),
            decorated   = this;

        return (target: T, propertyKey: string, descriptor: PerformAsMethodSignature) => {

            let performAs = descriptor.value,
                decorator = _.cloneDeep(descriptor);

            decorator.value = function(...args: any[]): PromiseLike<void> {

                let activity: Activity = description.interpolateWith(this, args);

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
        // todo: sniff the exception to find out about the Result. Did the test fail, or was it compromised?
        this.stageManager.notifyOf(new ActivityFinished(new Outcome(activity, Result.ERROR, error)));
    }
}

export function step<T extends Performable>(stepDescriptionTemplate: string): StepAnnotation<T> {
    return new Step(Serenity.stageManager()).describedUsing(stepDescriptionTemplate);
}

export type PerformAsMethodSignature = TypedPropertyDescriptor<(PerformsTasks) => PromiseLike<void>>;

export interface StepAnnotation<T extends Performable> {
    (target: T, propertyKey: string, descriptor: PerformAsMethodSignature): PerformAsMethodSignature;
}
