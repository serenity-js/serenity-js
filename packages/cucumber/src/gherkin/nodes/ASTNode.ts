import { Location } from './Location';

export interface ASTNode {
    type: string;
    location: Location;
}
