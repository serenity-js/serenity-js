// todo: DELETE
//
// import {Performable} from "../screenplay/pattern/performables";
// import * as fs from 'fs';
// import {Md5} from "ts-md5/dist/md5";
// import {ScreenshotCaptured} from "../serenity/events/domain_events";
// import {Screenshot} from "../serenity/domain";
// import {Serenity} from "../serenity/serenity";
// import moment = require("moment/moment");
//
// export enum TakeScreenshot {
//     BEFORE = 1 << 0,
//     AFTER  = 1 << 1,
//     BEFORE_AND_AFTER = BEFORE | AFTER,
// }
//
// export function screenshot<STEP extends Performable>(when: TakeScreenshot) {
//
//     // todo: some sort of Serenity.fs()... ?
//
//     function takeScreenshotIfNeeded(currentStage: TakeScreenshot) {
//         if (when & currentStage) {
//
//             let now = moment().valueOf();
//             // todo: capture time of the event
//             // todo: take screenshot
//             // todo: send event with path to screenshot
//
//             return browser.takeScreenshot().then(saveScreenshot(now, currentStage));
//         }
//     }
//
//     let saveScreenshot = (timestamp: number, currentStage: TakeScreenshot) => (data : string) => {
//
//         let filename = './' + Md5.hashStr(data) + '.png';
//
//         let stream   = fs.createWriteStream(filename);
//
//         stream.on('error', function (err) {
//             console.log(err);
//         });
//
//         stream.write(new Buffer(data, 'base64'));
//
//         stream.end();
//
//         Serenity.instance.record(new ScreenshotCaptured(new Screenshot(filename, currentStage), timestamp));
//     };
//
//     return (target: STEP, propertyKey: string, descriptor: TypedPropertyDescriptor<(PerformsTasks) => void>) => {
//
//         const step = descriptor.value;
//
//         descriptor.value = function(...args: any[]) {
//
//             takeScreenshotIfNeeded(TakeScreenshot.BEFORE);
//
//             step.apply(this, args);
//
//             takeScreenshotIfNeeded(TakeScreenshot.AFTER);
//         };
//
//         return descriptor;
//     };
// }