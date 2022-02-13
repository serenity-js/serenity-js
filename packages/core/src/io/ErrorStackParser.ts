import * as parser from 'error-stack-parser';
import StackFrame = require('stackframe');

/**
 * @desc
 *  A thin wrapper around error-stack-parser module
 *
 * @see https://www.npmjs.com/package/error-stack-parser
 *
 * @package
 */
export class ErrorStackParser {
    parse(error: Error): StackFrame[] {
        return parser.parse(error);
    }
}
