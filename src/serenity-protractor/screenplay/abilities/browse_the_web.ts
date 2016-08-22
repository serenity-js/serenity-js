import { defer } from '../../../serenity/recording/async';
import { Ability } from '../../../serenity/screenplay/ability';
import { UsesAbilities } from '../../../serenity/screenplay/actor';
import { Target, WebElement, WebElements } from '../ui/target';

export class BrowseTheWeb implements Ability {

    private actor: UsesAbilities;

    /**
     * Instantiates the Ability to PlayAnInstrument an Instrument, allowing the Actor to PerformASong
     *
     * @param browser
     * @return {BrowseTheWeb}
     */
    static using(browser: protractor.Protractor) {
        return new BrowseTheWeb(browser);
    }

    /**
     * Used to access the Actor's ability to BrowseTheWeb from within the Interaction classes, such as Click or Enter
     *
     * @param actor
     * @return {BrowseTheWeb}
     */
    static as(actor: UsesAbilities): BrowseTheWeb {
        return actor.abilityTo(BrowseTheWeb);
    }

    locate(target: Target): WebElement {
        return target.resolveUsing(this.browser.element);
    }

    locateAll(target: Target): WebElements {
        return target.resolveAllUsing(<any> this.browser.element);      // see: https://github.com/angular/protractor/issues/3350
    }

    takeScreenshot(): Promise<String> {
        return defer(() => this.browser.takeScreenshot());
    }

    get(destination: string, timeout?: number): Promise<void> {
        return defer(() => browser.get(destination, timeout));
    }

    // todo: is this needed?
    usedBy<U extends UsesAbilities>(actor: U): BrowseTheWeb {
        this.actor = actor;

        return this;
    }

    constructor(private browser: protractor.Protractor) {
    }
}
