import {Step, Screenshot} from "../../serenity/domain/model";
import {Md5} from "ts-md5/dist/md5";
import * as fs from "fs";

// todo: refactor
// - inject the dependencies instead of relying on globals
// - move to a promise-based fs api
// - avoid using the Deferred
export class Photographer {

    constructor() {     // uses: file system, browser,
    }

    takeAPictureOf(step: Step): PromiseLike<Screenshot> {
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