// todo: clean up

import {Performable} from "../pattern/performables";
import {Result, Step} from "../../serenity/domain/model";
import {Serenity} from "../../serenity/serenity";
import {Photographer} from "../../screenplay_protractor/recording/photography";
import {InterpolatedStep} from "./steps";
import {FileSystemOutlet} from "../../serenity/reporting/outlet";

export enum CaptureScreenshot {
    DO_NOT      = 1 << 0,
    BEFORE_STEP = 1 << 1,
    AFTER_STEP  = 1 << 2,
    BEFORE_AND_AFTER = BEFORE_STEP | AFTER_STEP,
}

export function step<STEP extends Performable>(stepDescriptionTemplate: string, captureScreenshotStage = CaptureScreenshot.DO_NOT) {

    // todo: should be configurable
    let photographer = new Photographer(new FileSystemOutlet(`${process.cwd()}/target/site/serenity/`), browser),
        interpolated = new InterpolatedStep(stepDescriptionTemplate);

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

                performAs.apply(this, args);

                afterStep(step);
            }
            catch(e) {
                onFailure(step, e);

                throw e;            // notify the test runner about the problem as well
            }
        };

        return descriptor;
    };
}