import { Duration } from './model';
import { Cast, StageCrewMember } from './stage';

/**
 * @interface
 */
export abstract class SerenityConfig {
    actors?:        Cast;
    crew?:          StageCrewMember[];
    cueTimeout?:    Duration;
}
