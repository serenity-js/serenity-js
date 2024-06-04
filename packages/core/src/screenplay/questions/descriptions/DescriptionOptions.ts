/**
 * Configuration options for {@apilink Question.description} and
 * the [`the`](/api/core/function/the/) function.
 *
 * @group Questions
 */
export interface DescriptionOptions {
    /**
     * The maximum length of the string representation of the value.
     * String representations longer than this value will be truncated and appended with an ellipsis.
     */
    maxLength: number;
}
