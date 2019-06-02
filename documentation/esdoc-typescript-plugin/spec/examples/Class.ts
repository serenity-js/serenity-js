export class Class {
    protected fullName: string;

    constructor(private firstName, protected lastName) {
        this.fullName = `${ firstName } ${ lastName}`;
    }
}
