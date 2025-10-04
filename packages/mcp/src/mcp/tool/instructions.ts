import { z } from 'zod';

export const InstructionSchema = z.object({
    type: z.string().describe('The type of instruction to perform'),
    target: z.string().describe('The target of the instruction'),
    reason: z.string().describe('The reason why the instruction should be performed'),
})

export abstract class Instruction {
    public constructor(
        public target: string,
        public reason: string,
    ) {
    }

    private instructionType(): string {
        return this.constructor.name
            .replace(/Instruction$/, '');
    }

    private transformFirstCharacter(text: string, transformation: (character: string) => string): string {
        return transformation.apply(text.charAt(0)) + text.slice(1);
    }

    title(): string {
        const type = this.transformFirstCharacter(
            this.instructionType()
                .replaceAll(/([a-z])([A-Z])/g, `$1 $2`)
                .toLowerCase(),
            String.prototype.toUpperCase
        );

        return `${ type } ${ this.target }`;
    }

    description(): string {
        return this.transformFirstCharacter(this.reason, String.prototype.toUpperCase);
    }

    toJSON(): z.infer<typeof InstructionSchema> {
        return {
            type: this.transformFirstCharacter(this.instructionType(), String.prototype.toLowerCase),
            target: this.target,
            reason: this.reason,
        }
    }
}

export class CallToolInstruction extends Instruction {
}

export class RequestUserActionInstruction extends Instruction {
}

export class UpdatePolicyInstruction extends Instruction {
}
