import { Duration } from './model';
import { DressingRoom, StageCrewMember } from './stage';

/**
 * @interface
 */
export abstract class SerenityConfig {
    actors?:        DressingRoom;
    crew?:          StageCrewMember[];
    cueTimeout?:    Duration;
}
