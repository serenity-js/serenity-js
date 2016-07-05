import * as moment from 'moment';
import {Scenario, Step, Outcome, Screenshot} from "./model";

export class DomainEvent<T> {
    constructor(public value:T, public timestamp?:number) {
        this.timestamp = timestamp || moment().valueOf();
    }
}

export class ScenarioStarted    extends DomainEvent<Scenario> {}
export class StepStarted        extends DomainEvent<Step> {}
export class StepCompleted      extends DomainEvent<Outcome<Step>> {}
export class ScenarioCompleted  extends DomainEvent<Outcome<Scenario>> {}