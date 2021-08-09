import 'mocha';

import { expect } from '@integration/testing-tools';
import { Path } from '@serenity-js/core/lib/io';

import { GAV } from '../../../src/cli/model';

describe('GAV', () => {

    describe('can be described using a string which format', () => {

        it('follows group:artifact:version', () => {
            const gav = GAV.fromString('net.serenity-bdd:serenity-cli:2.1.9');

            expect(gav.groupId).to.equal('net.serenity-bdd');
            expect(gav.artifactId).to.equal('serenity-cli');
            expect(gav.extension).to.equal('jar');
            expect(gav.version).to.equal('2.1.9');
            expect(gav.classifier).to.equal(undefined);
        });

        it('follows group:artifact:extension:version', () => {
            const gav = GAV.fromString('net.serenity-bdd:serenity:war:2.1.9');

            expect(gav.groupId).to.equal('net.serenity-bdd');
            expect(gav.artifactId).to.equal('serenity');
            expect(gav.extension).to.equal('war');
            expect(gav.version).to.equal('2.1.9');
            expect(gav.classifier).to.equal(undefined);
        });

        it('follows group:artifact:extension:classifier:version', () => {
            const gav = GAV.fromString('net.serenity-bdd:serenity-cli:jar:all:2.1.9');

            expect(gav.groupId).to.equal('net.serenity-bdd');
            expect(gav.artifactId).to.equal('serenity-cli');
            expect(gav.extension).to.equal('jar');
            expect(gav.version).to.equal('2.1.9');
            expect(gav.classifier).to.equal('all');
        });
    });

    describe('can be converted to a file name when the identifier', () => {
        it('follows group:artifact:version', () => {
            const gav = GAV.fromString('net.serenity-bdd:serenity-cli:2.1.9');

            expect(gav.toPath()).to.equal(new Path('serenity-cli-2.1.9.jar'));
        });

        it('follows group:artifact:extension:version', () => {
            const gav = GAV.fromString('net.serenity-bdd:serenity:war:2.1.9');

            expect(gav.toPath()).to.equal(new Path('serenity-2.1.9.war'));
        });

        it('follows group:artifact:extension:classifier:version', () => {
            const gav = GAV.fromString('net.serenity-bdd:serenity-cli:jar:all:2.1.9');

            expect(gav.toPath()).to.equal(new Path('serenity-cli-2.1.9-all.jar'));
        });
    });
});
