import { ActivityNode } from './ActivityNode.js';

export const Default = (props: Parameters<typeof ActivityNode>[0]): ReturnType<typeof ActivityNode> => ActivityNode(props);
