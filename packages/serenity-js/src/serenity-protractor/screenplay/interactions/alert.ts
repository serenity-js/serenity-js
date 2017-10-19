import { Interaction } from '@serenity-js/core/lib/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';

export class Alert {
    static accept = () => Interaction.where(`#actor accepts the alert popup`,
        actor => BrowseTheWeb.as(actor).acceptAlert(),
    );
    static dismiss = () => Interaction.where(`#actor dismisses the alert popup`,
        actor => BrowseTheWeb.as(actor).dismissAlert(),
    );
}
