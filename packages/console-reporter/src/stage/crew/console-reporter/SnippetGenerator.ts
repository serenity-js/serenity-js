import type { FileSystem } from 'packages/core/lib/io';
import { Path } from 'packages/core/lib/io';
import type { ProblemIndication } from 'packages/core/lib/model';

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
        if (!error.stack){
            throw new Error('No stack in error');
        }
        const {path, lineNo} = this.deconstruct(error.stack);
        const data = this.fileSystem.readFileSync(path, {encoding: 'utf8'}).split('\n');
        const start = Math.max(0, lineNo - 2);
        const end = Math.min(data.length, lineNo+3);

        const tokens: string[] = [];
        tokens.push(`at ${path.value.split('/').slice(-1)}:${lineNo}`)

        for (let lineIndex = start; lineIndex < end; lineIndex++) {
            const suffix = (lineIndex === lineNo? '>' : ' ') + lineIndex;
            tokens.push(`${suffix} | ${data[lineIndex]}`);
        }
        return tokens.join('\n');
    }

    private deconstruct(stack: string): {path: Path, lineNo: number, charNo: number} {
        try {
            const [path, lineNo, charNo] = stack
                .split('\n')[0] // first line
                .match(/\(.*\)/g)[0] // in format at something (path:lineNo:charNo)
                .replaceAll(/[()]/g, '') // without brackets
                .split(':');
            
            return {
                path: Path.fromSanitisedString(path),
                lineNo: Number.parseInt(lineNo),
                charNo: Number.parseInt(charNo)
            };
        }
        catch (error) {
            throw new Error('Error while parsing stack: ' + error);
        }
    }
}