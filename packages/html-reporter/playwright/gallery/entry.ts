import htm from 'htm';
import { h, render,type VNode } from 'preact';

const html = htm.bind(h);

// Discover story files via Vite's eager glob
const storyModules = import.meta.glob(
    '../../app/**/*.story.ts',
    { eager: true },
) as Record<string, Record<string, (props?: Record<string, unknown>) => VNode>>;

// Build a flat map: "components/common/ResultCount/Default" → component function
const stories: Record<string, (props?: Record<string, unknown>) => VNode> = {};

for (const [filePath, module] of Object.entries(storyModules)) {
    const match = filePath.match(/\/app\/(.+)\.story\.ts$/);
    if (!match) continue;
    for (const [exportName, component] of Object.entries(module)) {
        if (typeof component === 'function') {
            stories[`${ match[1] }/${ exportName }`] = component;
        }
    }
}

interface MountParameters {
    story: string;
    props?: Record<string, unknown>;
}

(window as any).mount = async ({ story, props }: MountParameters) => {
    const Story = stories[story];
    if (!Story) {
        throw new Error(`Unknown story: ${ story }. Available: ${ Object.keys(stories).join(', ') }`);
    }

    // Inject report data if provided via props
    if (props?.data !== undefined) {
        (window as any).__SERENITY_REPORT_DATA__ = props.data;
    }

    // Set theme if provided
    if (props?.theme) {
        document.documentElement.setAttribute('data-theme', String(props.theme));
    }

    // Remove fixture-level keys that aren't component props
    const componentProps = { ...props };
    delete componentProps.data;
    delete componentProps.theme;

    const container = document.getElementById('root')!;
    render(html`<${Story} ...${componentProps} />`, container);

    (window as any).__COMPONENT_RENDERED__ = true;
};

(window as any).unmount = async () => {
    const container = document.getElementById('root')!;
    render(null, container);
    (window as any).__COMPONENT_RENDERED__ = false;
};
