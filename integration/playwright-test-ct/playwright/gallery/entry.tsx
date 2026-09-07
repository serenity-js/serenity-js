import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';

const stories = import.meta.glob('../../src/**/*.story.{tsx,jsx}');
const id = (f: string) => f.replace(/^(\.\.\/)+src\//, '').replace(/\.story\.\w+$/, '');

async function resolve(storyId: string) {
    const separator = storyId.lastIndexOf('/');
    const [ path, name ] = [ storyId.slice(0, separator), storyId.slice(separator + 1) ];
    const file = Object.keys(stories).find(f => id(f) === path || id(f).endsWith('/' + path));
    const module_ = (file && await stories[file]()) as Record<string, any> | undefined;
    return module_?.[name] ?? module_?.default;
}

const rootElement = document.getElementById('root')!;
let root: Root | undefined;

(window as any).mount = async ({ story, props }: { story: string; props?: Record<string, any> }) => {
    const Story = await resolve(story);
    if (! Story) {
        throw new Error(`Unknown story: ${ story }`);
    }
    root ??= createRoot(rootElement);
    flushSync(() => root!.render(<Story { ...props } />));
};

(window as any).unmount = async () => {
    root?.unmount();
    root = undefined;
};
