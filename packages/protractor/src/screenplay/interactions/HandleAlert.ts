import { Interaction } from '@serenity-js/core/lib/screenplay';
import { BrowseTheWeb } from '../abilities';

export class HandleAlert {
    static accept = () => Interaction.where(`#actor accepts the alert popup`,
        actor => BrowseTheWeb.as(actor).acceptAlert(),
    );

    static dismiss = () => Interaction.where(`#actor dismisses the alert popup`,
        actor => BrowseTheWeb.as(actor).dismissAlert(),
    );
}
