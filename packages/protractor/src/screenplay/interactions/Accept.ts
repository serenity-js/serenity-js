import { Interaction } from '@serenity-js/core/lib/screenplay';
import { BrowseTheWeb } from '../abilities';

export class Accept {
    static alert = () => Interaction.where(`#actor accepts the alert popup`,
        actor => BrowseTheWeb.as(actor).acceptAlert()
    );
}
