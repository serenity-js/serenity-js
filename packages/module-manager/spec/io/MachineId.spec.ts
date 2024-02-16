import 'mocha';

import type nodeFs from 'node:fs';

import { expect } from '@integration/testing-tools';
import { createFsFromVolume, Volume } from 'memfs';

import { MachineId } from '../../src/io/MachineId.js';
import { MachineInfo } from '../../src/io/MachineInfo.js';
import { Stubs } from '../Stubs.js';

describe('MachineId', () => {

    const emptyFs = createFsFromVolume(Volume.fromJSON({})) as unknown as typeof nodeFs;
    const stubs = Stubs.from('io/stubs');

    it('creates an anonymous machine id that reasonably distinguishes one machine from another', () => {
        const info = new MachineInfo(
            stubs.get('os'),
            stubs.get('process'),
            emptyFs,
        );
        const id = new MachineId(info).create();

        expect(id).to.equal('b03dc9ebf1904cffffc9780419df1762c67b41b323c697d36dcd3b04dc1c5219');
    });

    it('works without mocks', () => {
        const info = new MachineInfo();
        const id = new MachineId(info).create();

        expect(id ).to.have.lengthOf(64);
    });
});