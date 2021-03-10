import { equals } from '@serenity-js/assertions';
import { AnswersQuestions, Check, PerformsActivities, Question, Task, UsesAbilities } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import { Spawn } from '../interactions';
import { TerminateFlow } from '../interactions/TerminateFlow';
import { FileExists, JavaExecutable } from '../questions';

/**
 * @package
 */
export class InvokeSerenityBDD extends Task {
    static at(pathToArtifact: Path) {
        return new InvokeSerenityBDD(pathToArtifact);
    }

    withArguments(args: Question<string[]>) {
        return new InvokeSerenityBDD(this.pathToArtifact, args, this.props);
    }

    withProperties(properties: Question<string[]>) {
        return new InvokeSerenityBDD(this.pathToArtifact, this.args, properties);
    }

    // tslint:disable-next-line:member-ordering
    constructor(
        private readonly pathToArtifact: Path,
        private readonly args: Question<string[]>  = Question.about(`no arguments`, actor => []),
        private readonly props: Question<string[]> = Question.about(`no properties`, actor => []),
    ) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Task}.
     *
     * @param {PerformsActivities & UsesAbilities & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~PerformsActivities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): PromiseLike<void> | PromiseLike<any> {

        return Promise.all([
                actor.answer(this.args),
                actor.answer(this.props),
            ])
            .then(([ args, props ]) =>
                actor.attemptsTo(
                    Check
                        .whether(FileExists.at(this.pathToArtifact), equals(false))
                        .andIfSo(TerminateFlow.because(
                            `I couldn't access the Serenity BDD CLI at ${ this.pathToArtifact.value }. ` +
                            `Did you remember to run \`serenity-bdd update\`?`,
                        )),
                    // todo: check if reports exist before invoking the jar?
                    Spawn.the(new JavaExecutable(), ...props, '-jar', this.pathToArtifact.value, ...args),
                ),
        );
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return `#actor invokes Serenity BDD`;
    }
}
