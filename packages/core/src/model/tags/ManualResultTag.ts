import { ManualTag } from './ManualTag';

/**
 * @access public
 */
export class ManualPassedTag extends ManualTag {
    constructor(name = 'ManualPassed') {  // parametrised constructor to make all tag constructors compatible
        super(name);
    }
}
