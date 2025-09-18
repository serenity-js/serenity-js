export class Request<Input extends Record<string, unknown>> {
    constructor(
        public readonly parameters: Input,
    ) {
    }
}
