import * as parser from 'error-stack-parser';

/**
 * @desc
 *  A thin wrapper around error-stack-parser module
 *
 * @see https://www.npmjs.com/package/error-stack-parser
 *
 * @package
 */
export class ErrorStackParser {
    parse(error: Error): parser.StackFrame[] {
        return parser.parse(error);
    }
}
