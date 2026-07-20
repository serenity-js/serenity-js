import htm from 'htm';
import { h } from 'preact';

const html = htm.bind(h);

export interface CategoryBreadcrumbProps {
    category: string;
    onSegmentClick: (segment: string) => void;
}

export function CategoryBreadcrumb({ category, onSegmentClick }: CategoryBreadcrumbProps): ReturnType<typeof html> {
    const segments = category.split(' › ');
    return html`${segments.map((segment, index) => html`<span class="clickable" onClick=${() => onSegmentClick(segment)}>${segment}</span>${index < segments.length - 1 ? html`<span class="breadcrumb-sep"> › </span>` : null}`)}`;
}
