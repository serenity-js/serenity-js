import { Check, equals, not } from '@serenity-js/assertions';
import { AnswersQuestions, Log, Note, PerformsActivities, Question, TakeNote, Task, UsesAbilities } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import { Notify, Spawn } from '../interactions';
import { TerminateFlow } from '../interactions/TerminateFlow';
import { FileExists, JavaExecutable } from '../questions';

/**
 * @package
 */
export class InvokeSerenityBDD extends Task {
    static at(pathToArtifact: Path) {
        return new InvokeSerenityBDD(pathToArtifact);
    }

    with(args: Question<string[]>) {
        return new InvokeSerenityBDD(this.pathToArtifact, args);
    }

    constructor(
        private readonly pathToArtifact: Path,
        private readonly args: Question<string[]> = Question.about(`no arguments`, actor => []),
    ) {
        super();
    }

    performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): PromiseLike<void> | PromiseLike<any> {

        return actor.answer(this.args)
            .then(args =>
                actor.attemptsTo(
                    Check
                        .whether(FileExists.at(this.pathToArtifact), equals(false))
                        .andIfSo(TerminateFlow.because(
                            `I couldn't access the Serenity BDD CLI at ${ this.pathToArtifact.value }. ` +
                            `Did you remember to run \`serenity-bdd update\`?`,
                        )),
                    // todo: check if reports exist ?
                    Spawn.the(new JavaExecutable(), '-jar', this.pathToArtifact.value, ...args),
                ),
        );
    }

    toString(): string {
        return `#actor invokes Serenity BDD`;
    }
}
