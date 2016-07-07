import {Step, Screenshot} from "../../serenity/domain/model";
import {Md5} from "ts-md5/dist/md5";
import * as fs from "fs";
import {Outlet} from "../../serenity/reporting/outlet";

// todo: refactor
// - inject the dependencies instead of relying on globals
// - move to a promise-based fs api
// - avoid using the Deferred
export class Photographer {

    constructor(private outlet: Outlet) {     // todo: inject: outlet, browser,
    }

    // private saveScreenshot(data) {
    //     let filename = Md5.hashStr(data) + '.png';
    //
    //     return this.outlet.sendPicture(filename, data);
    // }

    takeAPictureOf(step: Step): PromiseLike<Screenshot> {
        function saveScreenshot(data : string) : string {
            // todo: some sort of Serenity.fs()... ?

            // todo: fixme, should be configurable and async
            let filename = Md5.hashStr(data) + '.png',
                path     = './target/site/serenity/' + filename;

            let stream   = fs.createWriteStream(path);
            stream.on('error', console.error); // todo: do something sensible instead perhaps?
            stream.write(new Buffer(data, 'base64'));
            stream.end();

            return filename;
        }

        let deferred = new Deferred<Screenshot>();

        // return browser.takeScreenshot().then(data => this.saveScreenshot(data)).then(filename => {
        //     console.log('[VALUE]', filename, typeof filename);
        //
        //     return new Screenshot(step, filename);
        // });

        //
        // browser.takeScreenshot().then(data => this.saveScreenshot(data).then(filename => {
        //     console.log('[FILENAME]', filename, typeof filename);
        //
        //     deferred.resolve(new Screenshot(step, filename));
        // }));

        browser.takeScreenshot().then(data => saveScreenshot(data)).then((filename) => {
            console.log('[FILENAME]', filename, typeof filename);

            deferred.resolve(new Screenshot(step, filename));
        });

        return deferred.promise;
    }
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