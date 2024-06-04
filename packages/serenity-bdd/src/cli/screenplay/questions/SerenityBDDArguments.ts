import type { AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { Question, the } from '@serenity-js/core';

import type { Argv } from '../../Argv';

/**
 * @package
 */
export class SerenityBDDArguments extends Question<string[]> {
    private subject: string;

    private static Allowed =  [
        'destination',
        'features',
        'issueTrackerUrl',
        'jiraProject',
        'jiraUrl',
        'project',
        'source',
    ];

    static from(argv: Argv): SerenityBDDArguments {
        return new SerenityBDDArguments(argv);
    }

    constructor(private readonly argv: Argv) {
        super(the`Serenity BDD arguments: ${ argv }`);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): string[] {
        return Object.keys(this.argv)
            .filter(key => !! ~ SerenityBDDArguments.Allowed.indexOf(key) && !! this.argv[key])
            .flatMap(arg => [`--${ arg }`, this.argv[arg]]);
    }
}
