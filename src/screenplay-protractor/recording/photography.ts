import {Screenshot, Step} from '../../serenity/domain/model';
import {defer} from '../../serenity/recording/async';
import {Outlet} from '../../serenity/reporting/outlet';
import {Md5} from 'ts-md5/dist/md5';
import WebDriver = webdriver.WebDriver;

export class Photographer {

    constructor(private outlet: Outlet, private browser: WebDriver) { }

    takeAPictureOf(step: Step): PromiseLike<Screenshot> {

        let filenameFor    = (data) => Md5.hashStr(data) + '.png',
            saveScreenshot = (data) => this.outlet.sendPicture(filenameFor(data), data);

        return defer(this.browser.takeScreenshot()).
            then(saveScreenshot).
            then(path => new Screenshot(step, path));
    }
}
