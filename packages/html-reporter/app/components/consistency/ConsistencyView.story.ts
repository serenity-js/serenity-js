import { ConsistencyView } from './ConsistencyView.js';

type Props = Parameters<typeof ConsistencyView>[0];

export const Default = (props: Props): ReturnType<typeof ConsistencyView> => ConsistencyView(props);
