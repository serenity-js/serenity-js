/**
 * @group Integration
 */
export interface OutputDescriptor {
    value(): string;
    cleanUp(): Promise<void>;
}
