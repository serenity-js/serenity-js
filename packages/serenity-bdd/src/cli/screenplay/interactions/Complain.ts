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

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions & CollectsArtifacts} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: UsesAbilities & AnswersQuestions & CollectsArtifacts): PromiseLike<void> {
        return Promise.resolve(
            actor.collect(Complaint.fromJSON({
                description: this.description(),
                message:     this.error.message,
                stack:       this.error.stack,
            })),
        );
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return `#actor complains about: ${ this.error.message }`;
    }

    private description() {
        switch (true) {
            case /ETIMEDOUT/.test(this.error.message):
                return `Are you behind a proxy or a firewall that needs to be configured?`;
            case /self signed certificate in certificate chain/.test(this.error.message):
                return `If you're using a self-signed certificate you might want to check if it's configured correctly, ` +
                    `or use the --ignoreSSL option.`;
            default:
                return `I'm terribly sorry, but something didn't go according to plan.`;
        }
    }
}
