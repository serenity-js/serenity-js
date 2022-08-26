import { Tag } from './Tag';

/**
 * @access public
 */
export class ManualResultTag extends Tag {
    private readonly result;
    static readonly Type = 'External Test Results';

    constructor(result: string) {
        super(result, ManualResultTag.Type);
        this.result = result;
    }
    getResult(): string {
        return this.result;
    }
}
