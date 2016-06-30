import {Action, PerformsTasks} from '../../screenplay/pattern';
import {step} from '../../screenplay/reporting/annotations'

export class Click implements Action {
    
    public static on(locator: webdriver.Locator) : Click {
        return new Click(locator);
    }

    @step("{0} clicks on #locator")
    performAs(actor: PerformsTasks) {
        element(this.locator).click();
    }

    constructor(private locator:webdriver.Locator) { }
}