import { StepArgument } from './StepArgument';

export interface DocString extends StepArgument {
    type: 'DocString';
    content: string;
}
