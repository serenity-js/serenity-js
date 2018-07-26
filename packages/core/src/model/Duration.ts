import { TinyType } from 'tiny-types';

export class Duration extends TinyType {

    private static msPerSecond = 1000;
    private static msPerMinute = Duration.msPerSecond * 60;
    private static msPerHour   = Duration.msPerMinute * 60;
    private static msPerDay    = Duration.msPerHour * 24;
    private static msPerYear   = Duration.msPerDay * 365;

    static ofMillis  = (milliseconds: number) => new Duration(milliseconds);
    static ofSeconds = (seconds: number)      => Duration.ofMillis(seconds  * Duration.msPerSecond);
    static ofMinutes = (minutes: number)      => Duration.ofMillis(minutes  * Duration.msPerMinute);
    static ofHours   = (hours: number)        => Duration.ofMillis(hours    * Duration.msPerHour);
    static ofDays    = (days: number)         => Duration.ofMillis(days     * Duration.msPerDay);
    static ofYears   = (years: number)        => Duration.ofMillis(years    * Duration.msPerYear);

    constructor(public readonly milliseconds: number) {
        super();
    }

    toString() {
        const ms = this.milliseconds;

        // tslint:disable:space-within-parens
        const levels = [
            [ Math.floor(   ms / Duration.msPerYear), 'y'],
            [ Math.floor(  (ms % Duration.msPerYear) / Duration.msPerDay), 'd'],
            [ Math.floor( ((ms % Duration.msPerYear) % Duration.msPerDay) / Duration.msPerHour), 'h'],
            [ Math.floor((((ms % Duration.msPerYear) % Duration.msPerDay) % Duration.msPerHour) / Duration.msPerMinute), 'm'],
            [ Math.floor((((ms % Duration.msPerYear) % Duration.msPerDay) % Duration.msPerHour) % Duration.msPerMinute / Duration.msPerSecond), 's'],
            [ (((ms % Duration.msPerYear) % Duration.msPerDay) % Duration.msPerHour) % Duration.msPerMinute % Duration.msPerSecond, 'ms'],
        ];
        // tslint:enable:space-within-parens

        return levels.reduce((acc, l, i) => l[0] > 0 || i === levels.length
            ? `${ acc } ${ l[0] }${ l[1] }`
            : acc,
        '').trim() || '0ms';
    }
}
