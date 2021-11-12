import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';

import { Argv } from '../../Argv';

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
        super();
        this.subject = 'Serenity BDD arguments';
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): string[] {
        return Object.keys(this.argv)
            .filter(key => !! ~ SerenityBDDArguments.Allowed.indexOf(key) && !! this.argv[key])
            .flatMap(arg => [`--${ arg }`, this.argv[arg]]);
    }

    /**
     * @desc
     *  Changes the description of this question's subject.
     *
     * @param {string} subject
     * @returns {Question<T>}
     */
    describedAs(subject: string): this {
        this.subject = subject;
        return this;
    }

    toString(): string {
        return this.subject;
    }
}
