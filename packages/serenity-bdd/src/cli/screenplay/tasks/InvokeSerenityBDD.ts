import { equals } from '@serenity-js/assertions';
import { Answerable, AnswersQuestions, Check, PerformsActivities, Question, Task, UsesAbilities } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';

import { Spawn } from '../interactions';
import { TerminateFlow } from '../interactions/TerminateFlow';
import { FileExists, JavaExecutable } from '../questions';

/**
 * @package
 */
export class InvokeSerenityBDD extends Task {
    static at(pathToArtifact: Path): InvokeSerenityBDD {
        return new InvokeSerenityBDD(pathToArtifact);
    }

    withArguments(args: Answerable<string[]>): InvokeSerenityBDD {
        return new InvokeSerenityBDD(this.pathToArtifact, args, this.props);
    }

    withProperties(properties: Answerable<string[]>): InvokeSerenityBDD {
        return new InvokeSerenityBDD(this.pathToArtifact, this.args, properties);
    }

    constructor(
        private readonly pathToArtifact: Path,
        private readonly args: Answerable<string[]>  = Question.about(`no arguments`, actor => []),
        private readonly props: Answerable<string[]> = Question.about(`no properties`, actor => []),
    ) {
        super(`#actor invokes Serenity BDD`);
    }

    /**
     * @desc
     *  Makes the provided {@apilink @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@apilink @serenity-js/core/lib/screenplay~Task}.
     *
     * @param {PerformsActivities & UsesAbilities & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@apilink @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@apilink @serenity-js/core/lib/screenplay/actor~PerformsActivities}
     * @see {@apilink @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@apilink @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): Promise<void> | Promise<any> {

        return Promise.all([
            actor.answer(this.args),
            actor.answer(this.props),
        ]).
        then(([ args, props ]) =>
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
}
