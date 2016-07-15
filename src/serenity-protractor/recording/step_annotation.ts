// todo: clean up

import { Result, Step } from '../../serenity/domain/model';
import { NamedStep } from '../../serenity/recording/named_step';
import { FileSystemOutlet } from '../../serenity/reporting/outlet';
import { Actor, Performable, UsesAbilities } from '../../serenity/screenplay';
import { Serenity } from '../../serenity/serenity';
import { Md5HashedPictureNames, Photographer } from './photographer';

export enum CaptureScreenshot {
    DO_NOT      = 1 << 0,
    BEFORE_STEP = 1 << 1,
    AFTER_STEP  = 1 << 2,
    BEFORE_AND_AFTER = BEFORE_STEP | AFTER_STEP,
}

export function step<STEP extends Performable>(stepDescriptionTemplate: string, captureScreenshotStage = CaptureScreenshot.DO_NOT) {

    // todo: should be configurable
    let photographer = new Photographer(
            new FileSystemOutlet(`${process.cwd()}/target/site/serenity/`),
            new Md5HashedPictureNames('.png')
        ),
        interpolated = new NamedStep(stepDescriptionTemplate);

    function beforeStep(actor: UsesAbilities, step: Step) {

        if (CaptureScreenshot.BEFORE_STEP & captureScreenshotStage) {
            Serenity.instance.stepStarts(step.withScreenshot(photographer.photographWorkOf(actor)));
        } else {
            Serenity.instance.stepStarts(step);
        }
    }

    function afterStep(actor: UsesAbilities, step: Step) {

        if (CaptureScreenshot.AFTER_STEP & captureScreenshotStage) {
            Serenity.instance.stepCompleted(step.withScreenshot(photographer.photographWorkOf(actor)), Result.SUCCESS);
        } else {
            Serenity.instance.stepCompleted(step, Result.SUCCESS);
        }
    }

    function onFailure(actor: UsesAbilities, step: Step, e: Error) {
        // todo: sniff the exception to find out about the Result
        Serenity.instance.stepCompleted(step.withScreenshot(photographer.photographWorkOf(actor)), Result.FAILURE, e);
    }

    return (target: STEP, propertyKey: string, descriptor: TypedPropertyDescriptor<(PerformsTasks) => Promise<void>>) => {

        let performAs = descriptor.value;

        descriptor.value = function(...args: any[]): Promise<void> {

            let actor: Actor = args[0],
                step: Step   = interpolated.from(this, args);

            return Promise.resolve()
                .then(() => beforeStep(actor, step))
                .then(() => performAs.apply(this, args))
                .then(() => afterStep(actor, step), (e) => onFailure(actor, step, e));
        };

        return descriptor;
    };
}
