import { AnswersQuestions, CollectsArtifacts, Interaction, UsesAbilities } from '@serenity-js/core';
import { Complaint } from '../../model';

/**
 * @package
 */
export class Complain extends Interaction {
    static about(error: Error) {
        return new Complain(error);
    }

    constructor(private readonly error: Error) {
        super();
    }

    performAs(actor: UsesAbilities & AnswersQuestions & CollectsArtifacts): PromiseLike<void> {
        return Promise.resolve(
            actor.collect(Complaint.fromJSON({
                description: this.description(),
                message:     this.error.message,
                stack:       this.error.stack,
            })),
        );
    }

    toString(): string {
        return `#actor complains about: ${ this.error.message }`;
    }

    private description() {
        switch (true) {
            case /ETIMEDOUT/.test(this.error.message):
                return `Are you behind a proxy or a firewall that needs to be configured?`;
            case /self signed ceritificate in certificate chain/.test(this.error.message):
                return `If you\'re using a self-signed certificate you might want to check if it's configured correctly, ` +
                    `or use the --ignoreSSL option.`;
            default:
                return `I'm terribly sorry, but something didn't go according to plan.`;
        }
    }
}
