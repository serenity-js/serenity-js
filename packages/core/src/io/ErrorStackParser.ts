const parser = require('error-stack-parser');   // eslint-disable-line @typescript-eslint/no-var-requires
import StackFrame from 'stackframe';

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
