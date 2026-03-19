import type { OutputDescriptor } from './OutputDescriptor.js';

/**
 * @group Integration
 */
export class StandardOutputDescriptor implements OutputDescriptor {
    value(): string {
        return '';
    }

    cleanUp(): Promise<void> {
        return Promise.resolve();
    }
}
