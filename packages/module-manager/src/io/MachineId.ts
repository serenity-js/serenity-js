import { createHash } from 'crypto';

import type { MachineInfo } from './MachineInfo.js';

export class MachineId {
    constructor(private readonly info: MachineInfo) {
    }

    create(): string {
        return createHash('sha256')
            .update(this.info.os())
            .update(this.info.chip())
            .update(this.info.memory())
            .update(this.info.hostname())
            .update(this.info.macAddresses().join(''))
            .digest('hex');
    }
}
