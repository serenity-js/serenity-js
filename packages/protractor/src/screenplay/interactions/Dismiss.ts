import { Interaction } from '@serenity-js/core/lib/screenplay';
import { BrowseTheWeb } from '../abilities';

export class Dismiss {
    static alert = () => Interaction.where(`#actor dismisses the alert popup`,
        actor => BrowseTheWeb.as(actor).dismissAlert()
    );
}
