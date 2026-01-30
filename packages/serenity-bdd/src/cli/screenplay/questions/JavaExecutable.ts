import * as path from 'node:path';
import { promisify } from 'node:util';

import type { AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
const findJavaHome = promisify(require('find-java-home'));

/**
 * @package
 */
export class JavaExecutable extends Question<Promise<Path>> {
    private subject: string;

    constructor() {
        super(`java executable`);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Path> {
        return findJavaHome({ allowJre: true })
            .then(pathToJavaHome => path.join(pathToJavaHome, 'bin', this.javaFileName()))
            .then(Path.fromJSON);
    }

    private javaFileName() {
        return this.isWindows()
            ? 'java.exe'
            : 'java';
    }

    private isWindows() {
        return process.platform.indexOf('win') === 0;
    }
}
