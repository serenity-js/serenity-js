import { Duration } from './model';
import { Serenity } from './Serenity';
import { Clock, StageManager } from './stage';

const clock = new Clock();
// todo: timeout should come from the config
const stageManager = new StageManager(Duration.ofSeconds(3), clock);

export const serenity = new Serenity(stageManager);
