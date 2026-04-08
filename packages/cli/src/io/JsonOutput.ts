/**
 * Represents a CLI response that can be serialized to JSON.
 *
 * @group IO
 */
export interface CliResponse<T> {
    /** Whether the command succeeded */
    success: boolean;
    /** The response data (present when success is true) */
    data?: T;
    /** Error information (present when success is false) */
    error?: {
        /** Error code for programmatic handling */
        code: string;
        /** Human-readable error message */
        message: string;
        /** Suggestion for how to fix the error */
        suggestion?: string;
        /** Stack trace (optional, for debugging) */
        stack?: string;
    };
}

/**
 * Options for JSON output formatting.
 *
 * @group IO
 */
export interface JsonOutputOptions {
    /** Whether to pretty-print the JSON output */
    pretty?: boolean;
}

/**
 * Utility class for formatting CLI responses as JSON.
 *
 * All CLI commands output JSON to stdout for machine consumption.
 * This class ensures consistent formatting across all commands.
 *
 * ## Example
 *
 * ```typescript
 * import { JsonOutput } from '@serenity-js/cli';
 *
 * const response = {
 *     success: true,
 *     data: { message: 'Hello' },
 * };
 *
 * console.log(JsonOutput.format(response));
 * // {"success":true,"data":{"message":"Hello"}}
 *
 * console.log(JsonOutput.format(response, { pretty: true }));
 * // {
 * //   "success": true,
 * //   "data": {
 * //     "message": "Hello"
 * //   }
 * // }
 * ```
 *
 * @group IO
 */
export class JsonOutput {

    /**
     * Formats a CLI response as JSON.
     *
     * @param response - The response to format
     * @param options - Formatting options
     * @returns The JSON string
     */
    static format<T>(response: CliResponse<T>, options: JsonOutputOptions = {}): string {
        if (options.pretty) {
            return JSON.stringify(response, undefined, 2);
        }
        return JSON.stringify(response);
    }

    /**
     * Creates a success response.
     *
     * @param data - The response data
     * @returns A success response object
     */
    static success<T>(data: T): CliResponse<T> {
        return { success: true, data };
    }

    /**
     * Creates an error response.
     *
     * @param code - Error code
     * @param message - Error message
     * @param suggestion - Optional suggestion for fixing the error
     * @param stack - Optional stack trace
     * @returns An error response object
     */
    static error(code: string, message: string, suggestion?: string, stack?: string): CliResponse<never> {
        return {
            success: false,
            error: { code, message, suggestion, stack },
        };
    }
}
