import 'mocha';

import { expect } from '@integration/testing-tools';
import { given } from 'mocha-testdata';

import { CucumberFormat } from '../../src/cli';

/** @test {CucumberFormat} */
describe('CucumberFormat', () => {

    given([ {
        description:    `outputs to standard output on Unix`,
        format:         '../custom/formatter',
        formatter:      '../custom/formatter',
        output:         '',
    }, {
        description:    'outputs to standard output on Windows',
        format:         'C:\\custom\\formatter',
        formatter:      'C:\\custom\\formatter',
        output:         '',
    }, {
        description:    'uses relative unix paths to describe the location of both the formatter and its output',
        format:         '../custom/formatter:../formatter/output.txt',
        formatter:      '../custom/formatter',
        output:         '../formatter/output.txt',
    }, {
        description:    'uses absolute unix paths to describe the location of both the formatter and its output',
        format:         '/custom/formatter:/formatter/output.txt',
        formatter:      '/custom/formatter',
        output:         '/formatter/output.txt',
    }, {
        description:    'uses absolute Windows paths to describe the location of both the formatter and its output',
        format:         'C:\\custom\\formatter:C:\\formatter\\output.txt',
        formatter:      'C:\\custom\\formatter',
        output:         'C:\\formatter\\output.txt',
    } ]).
    it('represents native Cucumber format that', ({ format, formatter, output }) => {
        const cucumberFormat = new CucumberFormat(format);

        expect(cucumberFormat.value).to.equal(format);
        expect(cucumberFormat.formatter).to.equal(formatter);
        expect(cucumberFormat.output).to.equal(output);
    });
});
