import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { Argv } from '../../Argv';

/**
 * @package
 */
export class SystemProperties extends Question<string[]> {
    static from(argv: Argv) {
        return new SystemProperties(argv);
    }

    constructor(private readonly argv: Argv) {
        super();
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): string[] {
        return Object.keys(this.argv)
            .map(arg => `-D${ arg }=${ this.argv[arg] }`);
    }

    toString() {
        return 'system properties';
    }
}
