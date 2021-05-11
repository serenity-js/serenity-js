export class Chord {
    constructor(
        public  readonly name: string,
        private readonly E_6TH: number,
        private readonly A_5TH: number,
        private readonly D_4TH: number,
        private readonly G_3RD: number,
        private readonly B_2ND: number,
        private readonly E_1ST: number,
    ) {
    }

    toString(): string {
        return this.name;
    }
}
