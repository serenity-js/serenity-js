import { Screenshot, Step } from '../../serenity/domain/model';
import { Outlet } from '../../serenity/reporting/outlet';
import { UsesAbilities } from '../../serenity/screenplay/actor';
import { BrowseTheWeb } from '../screenplay/abilities/browse_the_web';
import { Md5 } from 'ts-md5/dist/md5';

export class Photographer {

    constructor(private outlet: Outlet) {
    }

    takeAPictureOf(actor: UsesAbilities, step: Step): Promise<Screenshot> {

        let filenameFor    = (data) => Md5.hashStr(data) + '.png',
            saveScreenshot = (data) => this.outlet.sendPicture(filenameFor(data), data);

        return BrowseTheWeb.as(actor).takeScreenshot()
            .then(saveScreenshot)
            .then(path => new Screenshot(step, path));
    }
}
