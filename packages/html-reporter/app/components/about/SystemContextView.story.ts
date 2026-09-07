import { SystemContextView } from './SystemContextView.js';

type Props = Parameters<typeof SystemContextView>[0];

export const Default = (props: Props): ReturnType<typeof SystemContextView> => SystemContextView(props);
