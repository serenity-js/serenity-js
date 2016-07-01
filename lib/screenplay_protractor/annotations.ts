import {Performable} from "../screenplay/pattern/performables";
import * as fs from 'fs';
import {Md5} from "ts-md5/dist/md5";

export enum TakeScreenshot {
    BEFORE = 1 << 0,
    AFTER  = 1 << 1,
    BEFORE_AND_AFTER = BEFORE | AFTER,
}

export function screenshot<STEP extends Performable>(when: TakeScreenshot) {

    // todo: some sort of Serenity.fs()... ?

    function takeScreenshotIfNeeded(currentStage: TakeScreenshot) {
        if (when & currentStage) {

            // todo: capture time of the event
            // todo: take screenshot
            // todo: send event with path to screenshot

            return browser.takeScreenshot().then(saveScreenshot);
        }
    }

    function saveScreenshot(data : string) : void{

        let filename = './' + Md5.hashStr(data) + '.png';
        console.log('SCREENSHOT NAME', filename);

        let stream   = fs.createWriteStream(filename);

        stream.on('error', function (err) {
            console.log(err);
        });

        stream.write(new Buffer(data, 'base64'));

        stream.end();
    }

    return (target: STEP, propertyKey: string, descriptor: TypedPropertyDescriptor<(any) => void>) => {

        const step = descriptor.value;

        descriptor.value = function(...args: any[]) {

            takeScreenshotIfNeeded(TakeScreenshot.BEFORE);

            step.apply(this, args);

            takeScreenshotIfNeeded(TakeScreenshot.AFTER);
        };

        return descriptor;
    };
}