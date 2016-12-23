import expect = require('../../../expect');

import { DomainEvent } from '../../../../src/serenity/domain';

describe ('Serenity Domain Events', () => {

    describe ('DomainEvent', () => {

        it ('can be represented as a string to help with trouble shooting', () => {

            let value     = 'value',
                timestamp = 1467201010000,
                event     = new DomainEvent<string>(value, timestamp);

            expect(event.toString()).to.equal(`${ timestamp } | DomainEvent: ${ value }`);
        });
    });

    describe ('Custom Domain Events', () => {

        class CustomEventOccurred extends DomainEvent<string> {};

        it ('can be represented as a string to help with trouble shooting', () => {

            let value     = 'value',
                timestamp = 1467201010000,
                event     = new CustomEventOccurred(value, timestamp);

            expect(event.toString()).to.equal(`${ timestamp } | CustomEventOccurred: ${ value }`);
        });
    });
});
