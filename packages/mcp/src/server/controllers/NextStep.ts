export interface NextStep {
    action: 'call_tool';
    reason: string;
}

export interface NextStepWithToolCall extends NextStep {
    action: 'call_tool';
    toolName: string;
}

