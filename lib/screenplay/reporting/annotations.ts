import {Performable} from "../pattern/performables";
import {Result, Screenshot, Step} from "../../serenity/domain";
import {Md5} from "ts-md5/dist/md5";
import * as fs from "fs";
import moment = require("moment/moment");
import {Serenity} from "../../serenity/serenity";
import {ScreenshotCaptured} from "../../serenity/events/domain_events";

export enum PictureTime {
    NONE   = 1 << 0,
    BEFORE = 1 << 1,
    AFTER  = 1 << 2,
    BEFORE_AND_AFTER = BEFORE | AFTER,
}

// todo: extract
class Photographer {

    // todo: should all the objects that need to communicate with the scribe receive a reference to it?
    // todo:    what else talks to the scribe?
    // todo: should the browser be given?
    constructor(private whenToCaptureScreenshot = PictureTime.NONE) { }

    takeAPictureOf(step: Step, currentPhase: PictureTime) {
        if(this.isAPhotoNeeded(currentPhase)) {
            let timestamp = moment().valueOf();

            return browser.takeScreenshot().
                then(this.saveScreenshot(timestamp, currentPhase)).
                then((filename) => Serenity.instance.record(new ScreenshotCaptured(new Screenshot(step, filename, currentPhase), timestamp)));
        }
    }

    private isAPhotoNeeded(currentStage: PictureTime): boolean {
        return !! (this.whenToCaptureScreenshot & currentStage);
    }

    // todo: extract
    private saveScreenshot = (timestamp: number, currentStage: PictureTime) => (data : string) : string => {

        // todo: some sort of Serenity.fs()... ?

        let filename = './' + Md5.hashStr(data) + '.png';

        let stream   = fs.createWriteStream(filename);
        stream.on('error', console.error); // todo: do something sensible instead perhaps?
        stream.write(new Buffer(data, 'base64'));
        stream.end();

        return filename;
    };
}

export function step<STEP extends Performable>(stepDescriptionTemplate: string, whenToCaptureScreenshot = PictureTime.NONE) {

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

    function interpolateStepDescription(currentPerformable: Performable, performAsMethodArguments: any[]) {
        const argToken = /{(\d+)}/g,
            fieldToken = /#(\w+)/g;

        return stepDescriptionTemplate.
            replace(fieldToken, using(currentPerformable)).
            replace(argToken, using(performAsMethodArguments))
    }

    return (target: STEP, propertyKey: string, descriptor: TypedPropertyDescriptor<(PerformsTasks) => void>) => {

        let step = descriptor.value;

        let photographer = new Photographer(whenToCaptureScreenshot);

        descriptor.value = function(...args: any[]): void {

            let interpolated = interpolateStepDescription(this, args);

            photographer.takeAPictureOf(new Step(interpolated), PictureTime.BEFORE);

            Serenity.instance.stepStarts(interpolated);

            try {
                step.apply(this, args);

                Serenity.instance.stepCompleted(interpolated, Result.SUCCESS);

                photographer.takeAPictureOf(new Step(interpolated), PictureTime.AFTER);
            }
            catch(e) {
                // todo: sniff the exception to find out the Result
                Serenity.instance.stepCompleted(interpolated, Result.FAILURE, e);

                // todo take a picture on error

                // notify the test runner about the problem as well
                throw e;
            }
        };

        return descriptor;
    };
}