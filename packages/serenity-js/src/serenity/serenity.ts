import { Config } from './config';
import { DomainEvent } from './domain/events';
import { Cast, Journal, Stage, StageCrewMember, StageManager } from './stage';

import _ = require('lodash');

// todo: move to default config
export const Default_Path_To_Reports = `${process.cwd()}/target/site/serenity/`;

export class Serenity {
    private stage: Stage = new Stage(new StageManager(new Journal()));
    private configuration: Config<SerenityConfig<Object>> = new Config({
        cwd: process.cwd(),
        crew: [],
        parameters: {},
        stageCueTimeout: 30 * 1000,
    });

    callToStageFor = (cast: Cast): Stage => this.stage.enter(cast);

    notify(event: DomainEvent<any>) {
        this.stage.manager.notifyOf(event);
    }

    stageManager = () => this.stage.manager;

    configure(config: SerenityConfig<Object>) {
        this.configuration = new Config(config).withFallback(this.configuration.get);

        this.configuration.get.crew.forEach(crewMember => crewMember.assignTo(this.stage));
    }

    get config(): SerenityConfig<Object> {
        return this.configuration.get;
    }
}

export interface SerenityConfig<T> {
    cwd?: string;
    crew?: StageCrewMember[];
    parameters?: T;
    stageCueTimeout?: number;
}
