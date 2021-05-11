import { OutputDescriptor } from './OutputDescriptor';

/**
 * @private
 */
export class StandardOutputDescriptor implements OutputDescriptor {
    value(): string {
        return '';
    }

    cleanUp(): Promise<void> {
        return Promise.resolve();
    }
}
