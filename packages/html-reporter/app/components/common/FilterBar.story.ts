import { FilterBar, type FilterBarProps } from './FilterBar.js';

const noop = (): void => { /* no-op */ };

export const Default = ({ onFilter = noop, ...props }: FilterBarProps): ReturnType<typeof FilterBar> =>
    FilterBar({ onFilter, ...props });
