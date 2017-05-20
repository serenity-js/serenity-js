import { Serenity } from '../src/serenity';
import expect = require('./expect');
import { DomainEvent } from '../src/domain/events';
import { Stage } from '../src/stage/stage';
import { StageCrewMember } from '../src/stage/stage_manager';

class BestBoy implements StageCrewMember {
    private assignToCalled = false;
    assigned = (): boolean => this.assignToCalled;

    assignTo = (stage: Stage) => this.assignToCalled = true;
    notifyOf = (event: DomainEvent<any>) => undefined; // no-op
}

describe('serenity', () => {

    it('is initialised with no stage crew', () => {
        const serenity = new Serenity();

        expect(serenity.config.crew).to.be.empty;
    });

    it('can have the stage crew configured', () => {
        const crewMember = new BestBoy();

        const serenity = new Serenity();
        serenity.configure({
            crew: [
                crewMember,
            ],
        });

        expect(serenity.config.crew).to.have.lengthOf(1);
        expect(serenity.config.crew).to.contain(crewMember);
        expect(crewMember.assigned()).to.be.true;
    });
});
