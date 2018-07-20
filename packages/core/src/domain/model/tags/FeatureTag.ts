import { Tag } from './Tag';

export class FeatureTag extends Tag {
    constructor(feature: string) {
        super(feature, 'feature');
    }
}
