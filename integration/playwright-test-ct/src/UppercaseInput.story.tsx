import UppercaseInput from './UppercaseInput';

export const Default = () => <UppercaseInput />;

export const WithInitialValue = ({ initialValue = '' }: { initialValue?: string }) => <UppercaseInput initialValue={initialValue} />;
