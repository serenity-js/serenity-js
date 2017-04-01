import { Config } from './config';
import { DomainEvent } from './domain/events';
import { Duration } from './duration';
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
        timeouts: {
            stageCue: Duration.ofSeconds(30),
        },
    });

    callToStageFor = (cast: Cast): Stage => this.stage.enter(cast);

    notify(event: DomainEvent<any>) {
        this.stage.manager.notifyOf(event);
    }

    stageManager = () => this.stage.manager;

    configure(config: SerenityConfig<Object>) {
        this.configuration = new Config(config).withFallback(this.configuration);

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
    timeouts?: {
        stageCue?: Duration,
    };
}
