import React, { ChangeEvent, useState } from 'react';

const UppercaseInput = (): React.JSX.Element => {
    const [ inputText, setInputText ] = useState('');

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputText(event.target.value);
    };

    return (
        <div className={'example-input'}>
            <input type="text" value={ inputText } onChange={ handleChange } />
            <p className={'output'}>{ inputText.toUpperCase() }</p>
        </div>
    );
};

export default UppercaseInput;
