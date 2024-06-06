import * as parser from 'error-stack-parser';
import path from 'path';

/**
 * A thin wrapper around error-stack-parser module
 *
 * ## Learn more
 * - [Error stack parser](https://www.npmjs.com/package/error-stack-parser)
 *
 * @group Errors
 */
export class ErrorStackParser {
    private constructor(private frames: parser.StackFrame[]){

    }
    static parse(error: Error): ErrorStackParser {
        return new ErrorStackParser(parser.parse(error));
    }

    withOnlyUserFrames(): ErrorStackParser{
        const nonSerenityNodeModulePattern = new RegExp(`node_modules` + `\\` + path.sep + `(?!@serenity-js`+ `\\` + path.sep +`)`);

        this.frames = this.frames.filter(frame => ! (
            frame?.fileName.startsWith('node:') ||          // node 16 and 18
            frame?.fileName.startsWith('internal') ||       // node 14
            nonSerenityNodeModulePattern.test(frame?.fileName)    // ignore node_modules, except for @serenity-js/*
        ));

        return this;
    }

    andGet(): parser.StackFrame[]{
        return this.frames;
    }
}