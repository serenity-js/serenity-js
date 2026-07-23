import type { VNode } from 'preact';
import { h } from 'preact';

export function RawHtml({ content, ...props }: { content: string; [key: string]: unknown }): VNode {
    return h('div', { ...props, dangerouslySetInnerHTML: { __html: content } }) as unknown as VNode;
}
