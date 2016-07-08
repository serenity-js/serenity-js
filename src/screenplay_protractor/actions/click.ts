import {step} from '../../screenplay/recording/annotations';
import {PerformsTasks} from '../../serenity/screenplay/actor';
import {Action} from '../../serenity/screenplay/performables';

export class Click implements Action {

    public static on(locator: webdriver.Locator): Click {
        return new Click(locator);
    }

    @step('{0} clicks on #locator')
    performAs(actor: PerformsTasks) {
        element(this.locator).click();
    }

    constructor(private locator: webdriver.Locator) { }
}
