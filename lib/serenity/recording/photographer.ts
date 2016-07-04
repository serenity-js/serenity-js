import {Md5} from "ts-md5/dist/md5";
import * as fs from "fs";
import {ScreenshotCaptured} from "../../serenity/domain/events";
import {Step, Screenshot} from "../domain/model";
import moment = require("moment/moment");
import {Serenity} from "../serenity";

export enum CaptureScreenshot {
    DO_NOT   = 1 << 0,
    BEFORE_STEP = 1 << 1,
    AFTER_STEP  = 1 << 2,
    BEFORE_AND_AFTER = BEFORE_STEP | AFTER_STEP,
}

export class Photographer {

    // todo: should all the objects that need to communicate with the scribe receive a reference to it?
    // todo:    what else talks to the scribe?
    // todo: should the browser be given?
    // todo: Photographer should not be coupled to Serenity
    constructor(private whenToCaptureScreenshot = CaptureScreenshot.DO_NOT) { }


    takeAPictureOf(step: Step, currentPhase: CaptureScreenshot) {
        if(this.isAPhotoNeeded(currentPhase)) {
            let timestamp = moment().valueOf();

            return browser.takeScreenshot().
                then(this.saveScreenshot(timestamp, currentPhase)).
                then((filename) => Serenity.instance.record(new ScreenshotCaptured(new Screenshot(step, filename), timestamp)));
        }
    }

    private isAPhotoNeeded(currentStage: CaptureScreenshot): boolean {
        return !! (this.whenToCaptureScreenshot & currentStage);
    }

    // todo: extract
    private saveScreenshot = (timestamp: number, currentStage: CaptureScreenshot) => (data : string) : string => {

        // todo: some sort of Serenity.fs()... ?

        let filename = './' + Md5.hashStr(data) + '.png';

        let stream   = fs.createWriteStream(filename);
        stream.on('error', console.error); // todo: do something sensible instead perhaps?
        stream.write(new Buffer(data, 'base64'));
        stream.end();

        return filename;
    };
}
