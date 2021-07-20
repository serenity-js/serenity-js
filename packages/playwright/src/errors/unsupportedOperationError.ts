export class UnsupportedOperationError extends Error {
    constructor(instruction?: string) {
        super(
            `This operation is not supported in playwright connector. ${
                instruction || ''
            }`.trim()
        );
    }
}
