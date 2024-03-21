import { ErrorStackParser } from '@serenity-js/core/lib';
import type { FileSystem } from '@serenity-js/core/lib/io';
import { Path } from '@serenity-js/core/lib/io';
import { FileSystemLocation } from '@serenity-js/core/lib/io';
import type { ProblemIndication } from '@serenity-js/core/lib/model';

/**
 * Class for generating code snippets
 */
export default class SnippetGenerator {

    constructor(private readonly fileSystem: FileSystem){

    }

    /**
     * Creates snippet for outcome's error
     * 
     * @param error decoupled error from `ProblemIndication`
     * @returns 
     * code snippet with few code lines surrounding error
     */
    createSnippetFor({error}: ProblemIndication): string {
        const location = this.parseToFSLoc(error);
        if (!location){
            return ''; // no need to generate snippet for non-user code
        }
        const {path, line} = location;
        const data = this.fileSystem.readFileSync(path, {encoding: 'utf8'}).split('\n');
        const start = Math.max(0, line - 2);
        const end = Math.min(data.length, line+3);

        const tokens: string[] = [];
        tokens.push(`at ${path.value.split('/').slice(-1)}:${line}`)

        for (let lineIndex = start; lineIndex < end; lineIndex++) {
            const suffix = (lineIndex === line? '>' : ' ') + lineIndex;
            tokens.push(`${suffix} | ${data[lineIndex]}`);
        }
        return tokens.join('\n');
    }

    private parseToFSLoc(error: Error): FileSystemLocation | undefined {
        const stackFrames = ErrorStackParser.parse(error)
            .withOnlyUserFrames()
            .andGet();

        if (stackFrames.length === 0){
            return undefined;
        }
        const invocationFrame = stackFrames[0];
        
        return new FileSystemLocation(
            Path.from(invocationFrame.fileName?.replace(/^file:/, '')),
            invocationFrame.lineNumber,
            invocationFrame.columnNumber,
        );
    }
}