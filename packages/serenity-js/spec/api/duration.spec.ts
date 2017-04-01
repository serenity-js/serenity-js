import expect = require('../expect');
import { Duration } from '../../src/serenity/duration';

describe('Duration', () => {

    it('can represent a time interval in milliseconds', () => {
        const duration = Duration.ofMillis(1000);
        expect(duration.toMillis()).to.equal(1000);
    });

    it('can represent a time interval in seconds', () => {
        const duration = Duration.ofSeconds(1);
        expect(duration.toMillis()).to.equal(1000);
    });

    it('represents the interval in [ms] when converted to string', () => {
        const duration = Duration.ofSeconds(1);
        expect(duration.toString()).to.equal('1000ms');
    });
});
