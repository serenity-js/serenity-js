import type { QuestionAdapter } from '@serenity-js/core';
import { Question } from '@serenity-js/core';

import type { Argv } from '../../Argv';

/**
 * @package
 */
export const SystemProperties = {
    of: (argv: Argv): QuestionAdapter<string[]> =>
        Question.about<string[]>('system properties', actor =>
            Object.keys(argv)
                .map(arg => `-D${ arg }=${ argv[arg] }`)),
}
