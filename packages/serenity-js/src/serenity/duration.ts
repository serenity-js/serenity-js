export class Duration {
    static ofMillis  = (milliseconds: number) => new Duration(milliseconds);
    static ofSeconds = (seconds: number)      => Duration.ofMillis(seconds * 1000);

    toMillis = () => this.milliseconds;
    toString = () => `${ this.milliseconds }ms`;

    constructor(private milliseconds: number) {
    }
}
