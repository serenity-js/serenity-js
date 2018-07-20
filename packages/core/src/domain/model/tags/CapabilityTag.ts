import { Tag } from './Tag';

export class CapabilityTag extends Tag {
    constructor(capability: string) {
        super(capability, 'capability');
    }
}
