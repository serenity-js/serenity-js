import { Serenity } from './Serenity';
import { Clock, StageManager } from './stage';

const clock = new Clock();
const stageManager = new StageManager(clock);

export const serenity = new Serenity(stageManager);

export * from './screenplay';
