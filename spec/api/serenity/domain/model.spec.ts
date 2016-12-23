import expect = require('../../../expect');

import { Activity, Tag } from '../../../../src/serenity/domain/model';

describe ('Serenity Domain Model', () => {

    describe ('Tag', () => {

        describe ('When parsing cucumber.js tags', () => {

            it ('can have no value', () => {
                let tag = Tag.from('@regression');

                expect(tag.type).to.equal('regression');
                expect(tag.value).to.be.empty;
                expect(tag.values).to.be.empty;
            });

            it ('can have a single value', () => {
                let tag = Tag.from('@priority: must-have');

                expect(tag.type).to.equal('priority');
                expect(tag.value).to.equal('must-have');
                expect(tag.values).to.deep.equal([ 'must-have' ]);
            });

            it ('can have multiple values', () => {
                let tag = Tag.from('@issues:    My-Project-123   ,  My-Project-789');

                expect(tag.type).to.equal('issues');
                expect(tag.value).to.equal('My-Project-123, My-Project-789');
                expect(tag.values).to.deep.equal([ 'My-Project-123', 'My-Project-789' ]);
            });
        });
    });

    describe ('Activity', () => {

        it ('is comparable', () => {

            let a1 = new Activity('Pays with a credit card'),
                a2 = new Activity('Pays with a credit card');

            expect(a1.equals(a2)).to.be.true;
            expect(a1).to.deep.equal(a2);
        });

        it ('can be represented as string', () => {
            let a = new Activity('Pays with a credit card');

            expect(a.toString()).to.equal('Pays with a credit card');
        });

        it ('can have a custom identifier', () => {
            let a = new Activity('Pays with a credit card', 'pays-with-a-credit-card');

            expect(a.toString()).to.equal('Pays with a credit card (id: pays-with-a-credit-card)');
        });
    });
});
