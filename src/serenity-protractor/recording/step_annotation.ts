// todo: clean up

import { ActivityFinished, ActivityStarts } from '../../serenity/domain/events';
import { Activity, Outcome, Result } from '../../serenity/domain/model';
import { NamedStepTemplate } from '../../serenity/recording/named_step';
import { Performable } from '../../serenity/screenplay';
import { Serenity } from '../../serenity/serenity';

// todo: add Significance

export function step<STEP extends Performable>(stepDescriptionTemplate: string) {

    let interpolated = new NamedStepTemplate(stepDescriptionTemplate);

    function beforeStep(activity: Activity) {
        Serenity.notify(new ActivityStarts(activity));
    }

    function afterStep(activity: Activity) {
        Serenity.notify(new ActivityFinished(new Outcome(activity, Result.SUCCESS)));
    }

    function onFailure(activity: Activity, error: Error) {
        // todo: sniff the exception to find out about the Result
        Serenity.notify(new ActivityFinished(new Outcome(activity, Result.FAILURE, error)));
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
