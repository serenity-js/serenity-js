import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import * as path from 'path';
import { promisify } from 'util';
const findJavaHome = promisify(require('find-java-home'));  // tslint:disable-line:no-var-requires

/**
 * @package
 */
export class JavaExecutable extends Question<Promise<Path>> {
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
