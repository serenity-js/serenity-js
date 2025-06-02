import { Tag } from './Tag';

/**
 * Used to categorise tests by the project they belong to.
 *
 * @access public
 */
export class ProjectTag extends Tag {
    static readonly Type = 'project';

    constructor(projectName: string) {
        super(projectName, ProjectTag.Type);
    }
}
