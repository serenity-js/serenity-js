// todo: clean up

import { ActivityFinished, ActivityStarts } from '../../serenity/domain/events';
import { Activity, Outcome, Result } from '../../serenity/domain/model';
import { NamedStepTemplate } from '../../serenity/recording/named_step';
import { Performable } from '../../serenity/screenplay';
import { Serenity } from '../../serenity/serenity';

export enum CaptureScreenshot {
    DO_NOT      = 1 << 0,
    BEFORE_STEP = 1 << 1,
    AFTER_STEP  = 1 << 2,
    BEFORE_AND_AFTER = BEFORE_STEP | AFTER_STEP,
}

// todo: add Significance

export function step<STEP extends Performable>(stepDescriptionTemplate: string, captureScreenshotStage = CaptureScreenshot.DO_NOT) {

    let interpolated = new NamedStepTemplate(stepDescriptionTemplate);

    function beforeStep(activity: Activity) {
        Serenity.instance.record(new ActivityStarts(activity));
    }

    function afterStep(activity: Activity) {
        Serenity.instance.record(new ActivityFinished(new Outcome(activity, Result.SUCCESS)));
    }

    function onFailure(activity: Activity, error: Error) {
        // todo: sniff the exception to find out about the Result
        Serenity.instance.record(new ActivityFinished(new Outcome(activity, Result.FAILURE, error)));
    }

    return (target: STEP, propertyKey: string, descriptor: TypedPropertyDescriptor<(PerformsTasks) => Promise<void>>) => {

        let performAs = descriptor.value;

        descriptor.value = function(...args: any[]): Promise<void> {

            let activity: Activity = interpolated.interpolateWith(this, args);

            return Promise.resolve()
                .then(() => beforeStep(activity))
                .then(() => performAs.apply(this, args))
                .then(() => afterStep(activity), (e) => onFailure(activity, e));
        };

        return descriptor;
    };
}
