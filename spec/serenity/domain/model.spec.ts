import { Tag } from '../../../src/serenity/domain/model';

import expect = require('../../expect');

describe('Serenity Domain Model', () => {

    describe('Tag', () => {

        describe('When parsing cucumber.js tags', () => {

            it('can have no value', () => {
                let tag = Tag.from('@regression');

                expect(tag.type).to.equal('regression');
                expect(tag.value).to.be.empty;
                expect(tag.values).to.be.empty;
            });

            it('can have a single value', () => {
                let tag = Tag.from('@priority: must-have');

                expect(tag.type).to.equal('priority');
                expect(tag.value).to.equal('must-have');
                expect(tag.values).to.deep.equal([ 'must-have' ]);
            });

            it('can have multiple values', () => {
                let tag = Tag.from('@issues:    My-Project-123   ,  My-Project-789');

                expect(tag.type).to.equal('issues');
                expect(tag.value).to.equal('My-Project-123, My-Project-789');
                expect(tag.values).to.deep.equal([ 'My-Project-123', 'My-Project-789' ]);
            });
        });
    });
});
