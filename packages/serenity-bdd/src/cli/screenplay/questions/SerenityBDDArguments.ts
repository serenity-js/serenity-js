import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { Argv } from '../../Argv';

/**
 * @package
 */
export class SerenityBDDArguments extends Question<string[]> {
    private static Allowed =  [
        'destination',
        'features',
        'issueTrackerUrl',
        'jiraProject',
        'jiraUrl',
        'project',
        'source',
    ];

    static from(argv: Argv) {
        return new SerenityBDDArguments(argv);
    }

    constructor(private readonly argv: Argv) {
        super('Serenity BDD arguments');
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): string[] {
        return flatten(Object.keys(this.argv)
            .filter(key => !! ~ SerenityBDDArguments.Allowed.indexOf(key) && !! this.argv[key])
            .map(arg => [`--${ arg }`, this.argv[arg]]));
    }
}

function flatten(list: any[]) {
    return list.reduce((acc, current) => {
        Array.isArray(current)
            ? acc.push(...flatten(current))
            : acc.push(current);
        return acc;
    }, []);
}
