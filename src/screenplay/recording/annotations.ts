// todo: clean up

import {Photographer} from '../../screenplay-protractor/recording/photography';
import {Result, Step} from '../../serenity/domain/model';
import {NamedStep} from '../../serenity/recording/named_step';
import {FileSystemOutlet} from '../../serenity/reporting/outlet';
import {Performable} from '../../serenity/screenplay/performables';
import {Serenity} from '../../serenity/serenity';

export enum CaptureScreenshot {
    DO_NOT      = 1 << 0,
    BEFORE_STEP = 1 << 1,
    AFTER_STEP  = 1 << 2,
    BEFORE_AND_AFTER = BEFORE_STEP | AFTER_STEP,
}

export function step<STEP extends Performable>(stepDescriptionTemplate: string, captureScreenshotStage = CaptureScreenshot.DO_NOT) {

    // todo: should be configurable
    let photographer = new Photographer(new FileSystemOutlet(`${process.cwd()}/target/site/serenity/`), browser),
        interpolated = new NamedStep(stepDescriptionTemplate);

    function beforeStep(step: Step) {

        if (CaptureScreenshot.BEFORE_STEP & captureScreenshotStage) {
            Serenity.instance.stepStarts(step.withScreenshot(photographer.takeAPictureOf(step)));
        } else {
            Serenity.instance.stepStarts(step);
        }
    }

    function afterStep(step: Step) {

        if (CaptureScreenshot.AFTER_STEP & captureScreenshotStage) {
            Serenity.instance.stepCompleted(step.withScreenshot(photographer.takeAPictureOf(step)), Result.SUCCESS);
        } else {
            Serenity.instance.stepCompleted(step, Result.SUCCESS);
        }
    }

    function onFailure(step: Step, e: Error) {
        // todo: sniff the exception to find out about the Result
        Serenity.instance.stepCompleted(step.withScreenshot(photographer.takeAPictureOf(step)), Result.FAILURE, e);
    }

    return (target: STEP, propertyKey: string, descriptor: TypedPropertyDescriptor<(PerformsTasks) => void>) => {

        let performAs = descriptor.value;

        descriptor.value = function(...args: any[]): void {

            let step = interpolated.from(this, args);

            try {
                beforeStep(step);

                // todo: maybe inject a take a photo step here and make the Actor take the picture themselves?

                performAs.apply(this, args);

                // todo: maybe inject a take a photo step here and make the Actor take the picture themselves?

                afterStep(step);
            }
            catch (e) {
                onFailure(step, e);

                throw e;            // notify the test runner about the problem as well
            }
        };

        return descriptor;
    };
}
