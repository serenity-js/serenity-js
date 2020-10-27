import { Question } from '@serenity-js/core';
import { Argv } from '../../Argv';

/**
 * @package
 */
export const SystemProperties = {
    of: (argv: Argv) =>
        Question.about<string[]>('system properties', actor =>
            Object.keys(argv)
                .map(arg => `-D${ arg }=${ argv[arg] }`)),
}
