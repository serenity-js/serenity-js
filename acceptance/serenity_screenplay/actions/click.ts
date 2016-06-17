import {Performable} from './../performable';
import {PerformsTasks} from './../performs_tasks';

export class Click implements Performable {
    
    public static on(locator: webdriver.Locator) : Click {
        return new Click(locator);
    }

    performAs(actor: PerformsTasks) {
        element(this.locator).click();
    }

    constructor(locator:webdriver.Locator) {
        this.locator = locator;
    }

    private locator: webdriver.Locator;
}