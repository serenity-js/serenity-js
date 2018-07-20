import { Activity } from '../Activity';

export interface PerformsTasks {
    attemptsTo(...tasks: Activity[]): Promise<void>;
}
