import { Question, QuestionAdapter } from '@serenity-js/core';

import { Argv } from '../../Argv';

/**
 * @package
 */
export const SystemProperties = {
    of: (argv: Argv): QuestionAdapter<string[]> =>
        Question.about<string[]>('system properties', actor =>
            Object.keys(argv)
                .map(arg => `-D${ arg }=${ argv[arg] }`)),
}
