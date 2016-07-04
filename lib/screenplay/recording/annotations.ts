// todo: clean up

import {Performable} from "../pattern/performables";
import {Result, Step, Screenshot} from "../../serenity/domain/model";
import {Serenity} from "../../serenity/serenity";
import {Md5} from "ts-md5/dist/md5";
import * as fs from "fs";
import reject = Q.reject;

export enum CaptureScreenshot {
    DO_NOT   = 1 << 0,
    BEFORE_STEP = 1 << 1,
    AFTER_STEP  = 1 << 2,
    BEFORE_AND_AFTER = BEFORE_STEP | AFTER_STEP,
}

class Deferred<T> {
    public promise: Promise<T>;
    public resolve: (T) => void;
    public reject:  (Error) => void;

    constructor() {
        this.promise = new Promise( (resolve, reject) => {
            this.resolve = resolve;
            this.reject  = reject;
        });
    }
}

export function step<STEP extends Performable>(stepDescriptionTemplate: string, captureScreenshotStage = CaptureScreenshot.DO_NOT) {

    // todo: extract to some sort of a Photographer class
    function takeAPictureOf(step: Step): Promise<Screenshot> {
        function saveScreenshot(data : string) : string {
            // todo: some sort of Serenity.fs()... ?

            // todo: fixme, should be configurable and async
            let filename = Md5.hashStr(data) + '.png';

            let stream   = fs.createWriteStream('./target/site/serenity/' + filename);
            stream.on('error', console.error); // todo: do something sensible instead perhaps?
            stream.write(new Buffer(data, 'base64'));
            stream.end();

            return filename;
        }

        let deferred = new Deferred<Screenshot>();

        browser.takeScreenshot().then(saveScreenshot).then((filename) => {
            console.log('[Screenshot] saved at', filename)
            deferred.resolve(new Screenshot(step, filename));
        });

        return deferred.promise;
    }


    function beforeStep(step: Step) {

        if (CaptureScreenshot.BEFORE_STEP & captureScreenshotStage) {
            Serenity.instance.stepStarts(step.withScreenshot(takeAPictureOf(step)));
        } else {
            Serenity.instance.stepStarts(step);
        }
    }

    function afterStep(step: Step) {

        if (CaptureScreenshot.AFTER_STEP & captureScreenshotStage) {
            Serenity.instance.stepCompleted(step.withScreenshot(takeAPictureOf(step)), Result.SUCCESS);
        } else {
            Serenity.instance.stepCompleted(step, Result.SUCCESS);
        }
    }

    function onFailure(step: Step, e: Error) {
        // todo: sniff the exception to find out about the Result
        Serenity.instance.stepCompleted(step.withScreenshot(takeAPictureOf(step)), Result.FAILURE, e);
    }

    return (target: STEP, propertyKey: string, descriptor: TypedPropertyDescriptor<(PerformsTasks) => void>) => {

        let performAs = descriptor.value;

        descriptor.value = function(...args: any[]): void {

            let step = interpolatedStep(stepDescriptionTemplate)(this, args);

            try {
                beforeStep(step);

                // take screenshot
                //   attach promise on the step
                //     emit "step started" with promised screenshot

                performAs.apply(this, args);

                // take screenshot
                // emit "step completed" with screenshot and result

                afterStep(step);
            }
            catch(e) {
                onFailure(step, e);

                // notify the test runner about the problem as well
                throw e;
            }
        };

        return descriptor;
    };
}

function interpolatedStep(template: string): (currentPerformable: Performable, performAsMethodArguments: any[]) => Step {
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

    return (currentPerformable: Performable, performAsMethodArguments: any[]) => {
        return new Step(template.
            replace(fieldToken, using(currentPerformable)).
            replace(argToken, using(performAsMethodArguments)));
    }
}