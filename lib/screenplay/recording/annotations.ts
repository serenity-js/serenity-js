// todo: clean up

import {Performable} from "../pattern/performables";
import {Result, Step} from "../../serenity/domain/model";
import {Serenity} from "../../serenity/serenity";
import {Photographer, CaptureScreenshot} from "../../serenity/recording/photographer";

export function step<STEP extends Performable>(stepDescriptionTemplate: string, whenToCaptureScreenshot = CaptureScreenshot.DO_NOT) {

    let photographer = new Photographer(whenToCaptureScreenshot);

    function beforeStep(stepName: string) {
        photographer.takeAPictureOf(new Step(stepName), CaptureScreenshot.BEFORE_STEP);

        Serenity.instance.stepStarts(stepName); // todo: maybe "step starts, needs a picture", photographer takes a photo, sticks it on the queue
    }

    function afterStep(stepName: string) {
        Serenity.instance.stepCompleted(stepName, Result.SUCCESS);

        photographer.takeAPictureOf(new Step(stepName), CaptureScreenshot.AFTER_STEP);
    }

    function onFailure(stepName: string, e: Error) {
        // todo: sniff the exception to find out about the Result
        Serenity.instance.stepCompleted(stepName, Result.FAILURE, e);

        // todo take a picture on error
    }

    return (target: STEP, propertyKey: string, descriptor: TypedPropertyDescriptor<(PerformsTasks) => void>) => {

        let step = descriptor.value;

        descriptor.value = function(...args: any[]): void {

            let stepName = interpolateStepNameUsing(stepDescriptionTemplate)(this, args);

            try {
                beforeStep(stepName);

                step.apply(this, args);

                afterStep(stepName);
            }
            catch(e) {
                onFailure(stepName, e);

                // notify the test runner about the problem as well
                throw e;
            }
        };

        return descriptor;
    };
}

function interpolateStepNameUsing(template: string): (currentPerformable: Performable, performAsMethodArguments: any[]) => string {
    const argToken = /{(\d+)}/g,
        fieldToken = /#(\w+)/g;

    function using(source: any) {
        return (token: string, field: string|number) => {
            switch({}.toString.call(source[field])) {
                case '[object Function]': return source[field]();
                case '[object Array]':    return source[field].join(', ');
                case '[object Object]':   return source[field].toString();
                default:                  return source[field];
            }
        }
    }

    return (currentPerformable: Performable, performAsMethodArguments: any[]) =>
        template.
            replace(fieldToken, using(currentPerformable)).
            replace(argToken, using(performAsMethodArguments))
}