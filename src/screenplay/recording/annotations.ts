// todo: clean up

import { Photographer } from '../../screenplay-protractor/recording/photography';
import { Result, Step } from '../../serenity/domain/model';
import { NamedStep } from '../../serenity/recording/named_step';
import { FileSystemOutlet } from '../../serenity/reporting/outlet';
import { Actor } from '../../serenity/screenplay/actor';
import { Performable } from '../../serenity/screenplay/performables';
import { Serenity } from '../../serenity/serenity';

export enum CaptureScreenshot {
    DO_NOT      = 1 << 0,
    BEFORE_STEP = 1 << 1,
    AFTER_STEP  = 1 << 2,
    BEFORE_AND_AFTER = BEFORE_STEP | AFTER_STEP,
}

export function step<STEP extends Performable>(stepDescriptionTemplate: string, captureScreenshotStage = CaptureScreenshot.DO_NOT) {

    // todo: should be configurable
    let photographer = new Photographer(new FileSystemOutlet(`${process.cwd()}/target/site/serenity/`)),
        interpolated = new NamedStep(stepDescriptionTemplate);

    function beforeStep(actor: Actor, step: Step) {

        if (CaptureScreenshot.BEFORE_STEP & captureScreenshotStage) {
            Serenity.instance.stepStarts(step.withScreenshot(photographer.takeAPictureOf(actor, step)));
        } else {
            Serenity.instance.stepStarts(step);
        }
    }

    function afterStep(actor: Actor, step: Step) {

        if (CaptureScreenshot.AFTER_STEP & captureScreenshotStage) {
            Serenity.instance.stepCompleted(step.withScreenshot(photographer.takeAPictureOf(actor, step)), Result.SUCCESS);
        } else {
            Serenity.instance.stepCompleted(step, Result.SUCCESS);
        }
    }

    function onFailure(actor: Actor, step: Step, e: Error) {
        // todo: sniff the exception to find out about the Result
        Serenity.instance.stepCompleted(step.withScreenshot(photographer.takeAPictureOf(actor, step)), Result.FAILURE, e);
    }

    return (target: STEP, propertyKey: string, descriptor: TypedPropertyDescriptor<(PerformsTasks) => void>) => {

        let performAs = descriptor.value;

        descriptor.value = function(...args: any[]): void {

            let actor: Actor = args[0],
                step: Step   = interpolated.from(this, args);

            try {
                beforeStep(actor, step);

                performAs.apply(this, args);

                afterStep(actor, step);
            }
            catch (e) {
                onFailure(actor, step, e);

                throw e;            // notify the test runner about the problem as well
            }
        };

        return descriptor;
    };
}
