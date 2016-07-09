import {step} from '../../screenplay/recording/annotations';
import { PerformsTasks, UsesAbilities } from '../../serenity/screenplay/actor';
import {Action} from '../../serenity/screenplay/performables';
import { BrowseTheWeb } from '../abilities/browse_the_web';

export class Click implements Action {

    public static on(locator: webdriver.Locator): Click {
        return new Click(locator);
    }

    @step('{0} clicks on #locator')
    performAs(actor: PerformsTasks & UsesAbilities) {
        BrowseTheWeb.as(actor).findElement(this.locator).click();
    }

    constructor(private locator: webdriver.Locator) { }
}
