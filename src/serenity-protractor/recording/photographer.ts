import { Screenshot, Step } from '../../serenity/domain/model';
import { Outlet } from '../../serenity/reporting/outlet';
import { UsesAbilities } from '../../serenity/screenplay/actor';
import { BrowseTheWeb } from '../screenplay/abilities/browse_the_web';
import { Md5 } from 'ts-md5/dist/md5';

export class Photographer {

    constructor(private outlet: Outlet, private naming: PictureNamingStrategy) {
    }

    takeAPictureOf(actor: UsesAbilities, step: Step): Promise<Screenshot> {

        let saveScreenshot = (data) => this.outlet.sendPicture(this.naming.nameFor(data), data);

        return BrowseTheWeb.as(actor).takeScreenshot()
            .then(saveScreenshot)
            .then(path => new Screenshot(step, path));
    }
}

export interface PictureNamingStrategy {
    nameFor(base64encodedData: string): string;
}

export class Md5HashedPictureNames implements PictureNamingStrategy {

    constructor(private fileExtension: string = '') {
    }

    nameFor(base64encodedData: string): string {
        return Md5.hashStr(base64encodedData) + this.extension();
    }

    private extension() {
        return !! this.fileExtension ? '.' + this.fileExtension : '';
    }
}
