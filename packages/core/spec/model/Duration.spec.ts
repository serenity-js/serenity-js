import 'mocha';
import { given } from 'mocha-testdata';

import { Duration } from '../../src/model';
import { expect } from '../expect';

/** @test {Duration} */
describe('Duration', () => {

    describe('represents a duration of time that', () => {

        given<Duration, number>(
            [ Duration.ofMilliseconds(1),     1                               ],
            [ Duration.ofSeconds(1),    1 * 1000                        ],
            [ Duration.ofMinutes(1),    60 * 1 * 1000                   ],
            [ Duration.ofHours(1),      60 * 60 * 1 * 1000              ],
            [ Duration.ofDays(1),       24 * 60 * 60 * 1 * 1000         ],
            [ Duration.ofYears(1),      365 * 24 * 60 * 60 * 1 * 1000   ],
        ).
        it('can be easily converted to milliseconds', (duration: Duration, expectedMilliseconds: number) => {
            expect(duration.inMilliseconds()).to.equal(expectedMilliseconds);
        });

        given<Duration, string>(
            [ Duration.ofMilliseconds(100),       '100ms'     ],
            [ Duration.ofMilliseconds(2200),      '2s 200ms'  ],
            [ Duration.ofMilliseconds(132000),    '2m 12s'    ],
            [ Duration.ofMilliseconds(7921000),   '2h 12m 1s' ],
            [ Duration.ofMilliseconds(190080000), '2d 4h 48m' ],
        ).
        it('can be presented in a human-friendly format', (duration: Duration, expected: string) => {
            expect(duration.toString()).to.equal(expected);
        });
    });
});
