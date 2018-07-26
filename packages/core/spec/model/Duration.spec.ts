import 'mocha';
import { given } from 'mocha-testdata';

import { Duration } from '../../src/model';
import { expect } from '../expect';

describe('Duration', () => {

    describe('represents a duration of time that', () => {

        given<Duration, number>(
            [ Duration.ofMillis(1),     1                               ],
            [ Duration.ofSeconds(1),    1 * 1000                        ],
            [ Duration.ofMinutes(1),    60 * 1 * 1000                   ],
            [ Duration.ofHours(1),      60 * 60 * 1 * 1000              ],
            [ Duration.ofDays(1),       24 * 60 * 60 * 1 * 1000         ],
            [ Duration.ofYears(1),      365 * 24 * 60 * 60 * 1 * 1000   ],
        ).
        it('can be easily converted to milliseconds', (duration: Duration, expectedMilliseconds: number) => {
            expect(duration.milliseconds).to.equal(expectedMilliseconds);
        });

        given<Duration, string>(
            [ Duration.ofMillis(100),       '100ms'     ],
            [ Duration.ofMillis(2200),      '2s 200ms'  ],
            [ Duration.ofMillis(132000),    '2m 12s'    ],
            [ Duration.ofMillis(7921000),   '2h 12m 1s' ],
            [ Duration.ofMillis(190080000), '2d 4h 48m' ],
        ).
        it('can be presented in a human-friendly format', (duration: Duration, expected: string) => {
            expect(duration.toString()).to.equal(expected);
        });
    });
});
